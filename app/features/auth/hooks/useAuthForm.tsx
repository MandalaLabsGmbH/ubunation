import { FormEvent, useState } from 'react';
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

export type AuthMode = 'register' | 'login-password' | 'login-email';

export function useAuthForm(onSuccess: () => void) {
    const [mode, setMode] = useState<AuthMode>('login-email');
    
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
            setEmail(formEmail);
            setPassword(formPassword);
            setModalMode('register');
            setIsModalOpen(true);
        } catch (err) {
            if (err instanceof Error && err.name === 'UsernameExistsException') {
                try {
                    await cognitoResendConfirmation(formEmail);
                    setEmail(formEmail);
                    setPassword(formPassword);
                    setModalMode('register');
                    setIsModalOpen(true);
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
            onSuccess(); // Signal success to the calling component

        } catch(err) {
             if (err instanceof Error && err.message.includes('UserNotConfirmedException')) {
                await cognitoResendConfirmation(formEmail);
                setEmail(formEmail);
                setPassword(formPassword);
                setModalMode('register');
                setIsModalOpen(true);
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
            setEmail(formEmail);
            setModalMode('login');
            setIsModalOpen(true);
        } catch (err) {
            if (err instanceof Error && err.name === 'UserAlreadyAuthenticatedException') {
                try {
                    await amplifySignOut();
                    await cognitoInitiateEmailLogin(formEmail);
                    setEmail(formEmail);
                    setModalMode('login');
                    setIsModalOpen(true);
                } catch (retryErr) {
                    console.log(retryErr);
                    setError(AuthErrors.SESSION_RESET);
                }
            } else if (err instanceof Error && err.name === 'UserNotFoundException') {
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
            console.log('hook test1');
            if (modalMode === 'register') {
                console.log('hook test2');
                await cognitoConfirm(email, confirmationCode, { source: 'webapp-confirmation' });
                console.log('hook test3');
                setIsModalOpen(false);
                console.log('hook test4');
                setLoading(true);
                console.log('hook test5');
                await amplifySignIn({ username: email, password: password });
                console.log('hook test6');
                const loginResponse = await nextAuthSignIn("credentials", {
                    username: email,
                    password: password,
                    redirect: false,
                });
                console.log('hook test7');
                if (loginResponse?.error) throw new Error("Login failed after confirmation.");
                await submitUserCollectible(email);
                console.log('hook test8');
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
            console.log('hook test9');
            onSuccess(); // Signal success
    
        } catch (error) {
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
        modalMode,
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
        resetFormState
    };
}