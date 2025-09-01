import { FormEvent, useState, useCallback } from 'react';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { 
    signIn as amplifySignIn, 
    signOut as amplifySignOut 
} from 'aws-amplify/auth';
import { 
    cognitoRegister, 
    cognitoConfirm, 
    cognitoInitiateEmailLogin, 
    cognitoCompleteEmailLogin,
    cognitoResendConfirmation
} from '@/app/_helpers/registerHelper';
import { submitUserCollectible } from '@/app/_helpers/apiHelpers';
import { AuthErrors, AuthError } from '@/app/_helpers/authErrors';
import { AuthModalView } from '@/app/contexts/AuthModalContext';

export type AuthMode = AuthModalView;

export function useAuthForm(onSuccess: () => void) {
    const [mode, setMode] = useState<AuthModalView>('login-email');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AuthError>('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'register' | 'login'>('register');
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [modalError, setModalError] = useState<AuthError>('');
    
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    
    const resetFormState = () => {
        setLoading(false);
        setError('');
        setEmail('');
        setPassword('');
        setIsModalOpen(false);
        setIsConfirming(false);
        setConfirmationCode('');
        setModalError('');
    };

    // New function to set the initial state from the outside
    const setInitialState = useCallback((view: AuthModalView, initialEmail: string) => {
        setMode(view);
        setEmail(initialEmail);
    }, []);

    // New function to directly show the confirmation modal
    const showConfirmationModal = useCallback((emailToShow: string, mode: 'register' | 'login') => {
        setEmail(emailToShow);
        setModalMode(mode);
        setIsModalOpen(true);
    }, []);


    const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        const formEmail = formData.get('email') as string;
        const formPassword = formData.get('password') as string;
        const formConfirmPassword = formData.get('confirmPassword') as string;

        if (formPassword !== formConfirmPassword) {
            setError(AuthErrors.PASSWORD_NO_MATCH);
            setLoading(false);
            return;
        }

        try {
            await cognitoRegister(formEmail, formPassword, { source: 'webapp-registration' });
            showConfirmationModal(formEmail, 'register');
        } catch (err) {
            if (err instanceof Error && err.name === 'UsernameExistsException') {
                try {
                    await cognitoResendConfirmation(formEmail);
                    showConfirmationModal(formEmail, 'register');
                } catch (resendErr) {
                    console.log(resendErr);
                    setError(
                        <span>
                            This user already exists. Please{' '}
                            <button className="underline" onClick={() => { resetFormState(); setMode('login-email'); }}>
                                log in
                            </button>
                            {' '}to continue.
                        </span>
                    );
                }
            } else {
                setError(AuthErrors.DEFAULT);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        const formEmail = formData.get('email') as string;
        const formPassword = formData.get('password') as string;

        try {
            await amplifySignOut();
            await amplifySignIn({ 
                username: formEmail, 
                password: formPassword 
            });

            const result = await nextAuthSignIn('credentials', {
                username: formEmail,
                password: formPassword,
                redirect: false,
            });

            if (result?.error) throw new Error(result.error);
            onSuccess();

        } catch(err) {
             if (err instanceof Error && err.message.includes('UserNotConfirmedException')) {
                await cognitoResendConfirmation(formEmail);
                showConfirmationModal(formEmail, 'register');
             } else {
                setError(AuthErrors.LOGIN_FAILED);
             }
             setLoading(false);
        }
    };

    const handleEmailLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData(e.currentTarget);
        const formEmail = formData.get('email') as string;

        try {
            await cognitoInitiateEmailLogin(formEmail);
            showConfirmationModal(formEmail, 'login');
        } catch (err) {
            if (err instanceof Error && err.name === 'UserNotFoundException') {
                setError(
                    <span>
                        No account found with this email. Please{' '}
                        <button className="underline" onClick={() => { resetFormState(); setMode('register'); }}>
                            register
                        </button>
                        {' '}to continue.
                    </span>
                );
            } else {
                setError(AuthErrors.DEFAULT);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setIsConfirming(true);
        setModalError('');
    
        try {
            await amplifySignOut();
            if (modalMode === 'register') {
                await cognitoConfirm(email, confirmationCode, { source: 'webapp-confirmation' });
                
                setIsModalOpen(false);
                setLoading(true);

                await amplifySignIn({ username: email, password: password });

                const loginResponse = await nextAuthSignIn("credentials", {
                    username: email,
                    password: password,
                    redirect: false,
                });
                if (loginResponse?.error) throw new Error("Login failed after confirmation.");
                await submitUserCollectible(email);
            } else {
                const idToken = await cognitoCompleteEmailLogin(confirmationCode);
                setIsModalOpen(false);
                setLoading(true);

                const loginResponse = await nextAuthSignIn("cognito-token", {
                    idToken: idToken,
                    redirect: false,
                });
                if (loginResponse?.error) throw new Error("Token-based login failed.");
            }
    
            onSuccess();
    
        } catch (error) {
            console.error("Authentication confirmation failed:", error);

            setLoading(false);
            setIsConfirming(false);
            setIsModalOpen(true);
            if (error instanceof Error && error.name === 'CodeMismatchException') {
                setModalError(AuthErrors.CODE_MISMATCH);
            } else {
                const errorMessage = error instanceof Error ? error.message : AuthErrors.DEFAULT;
                setModalError(errorMessage);
            }
        }
    };

    const handleBackFromModal = () => setIsAlertOpen(true);
    const handleStartOver = () => {
        setIsModalOpen(false);
        setIsAlertOpen(false);
        resetFormState();
    };

    return {
        mode,
        setMode,
        loading,
        error,
        email,
        isModalOpen,
        isConfirming,
        confirmationCode,
        setConfirmationCode,
        modalError,
        isAlertOpen,
        setIsAlertOpen,
        handleRegisterSubmit,
        handlePasswordLoginSubmit,
        handleEmailLoginSubmit,
        handleConfirm,
        handleBackFromModal,
        handleStartOver,
        resetFormState,
        setInitialState,
        showConfirmationModal
    };
}
