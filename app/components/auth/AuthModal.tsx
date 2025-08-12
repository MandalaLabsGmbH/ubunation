'use client'

import { useEffect, JSX } from 'react';
import { useAuthModal } from '@/app/contexts/AuthModalContext';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthForm } from '@/app/features/auth/hooks/useAuthForm';
import RegisterForm from '@/app/features/auth/components/RegisterForm';
import LoginPasswordForm from '@/app/features/auth/components/LoginPasswordForm';
import LoginEmailForm from '@/app/features/auth/components/LoginEmailForm';
import ConfirmationModal from '@/app/features/auth/components/ConfirmationModal';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { configureAmplify } from '@/lib/amplify-config';

export default function AuthModal() {
  // Get the new initial state values from the context
  const { isOpen, closeModal, redirectUrl, initialView, initialEmail } = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    configureAmplify();
  }, []);

  const handleClose = () => {
    resetFormState();
    closeModal();
  }

  const handleSuccess = () => {
    if (redirectUrl) {
        router.push(redirectUrl);
    }
    router.refresh();
    handleClose();
  };

  const {
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
    // Add new functions from the hook
    setInitialState,
    showConfirmationModal
  } = useAuthForm(handleSuccess);

  // Use an effect to set the initial state when the modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialView === 'confirm-code' && initialEmail) {
        // If we want to start at the code entry screen
        showConfirmationModal(initialEmail, 'login');
      } else {
        // Otherwise, set the mode for the main form
        setInitialState(initialView, initialEmail);
      }
    }
  }, [isOpen, initialView, initialEmail, setInitialState, showConfirmationModal]);


  if (!isOpen) {
    return null;
  }

  let formComponent: JSX.Element;

  switch (mode) {
    case 'register':
      formComponent = <RegisterForm onSubmit={handleRegisterSubmit} loading={loading} error={error} setMode={setMode} resetForm={resetFormState} />;
      break;
    case 'login-password':
      formComponent = <LoginPasswordForm onSubmit={handlePasswordLoginSubmit} loading={loading} error={error} setMode={setMode} resetForm={resetFormState} />;
      break;
    case 'login-email':
    default:
      formComponent = <LoginEmailForm onSubmit={handleEmailLoginSubmit} loading={loading} error={error} setMode={setMode} resetForm={resetFormState} />;
      break;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
        <div className="relative bg-background rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
          <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
          <Card className='pt-0 mx-auto max-w-sm border-0 shadow-none mt-8'>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {mode === 'register' && 'Create an Account'}
                {mode === 'login-password' && 'Login'}
                {mode === 'login-email' && 'Login'}
              </CardTitle>
              <CardDescription className="text-center">
                {mode === 'register' && 'Sign up to get started.'}
                {mode === 'login-password' && 'Log in to your account.'}
                {mode === 'login-email' && 'Get a magic link sent to your email.'}
              </CardDescription>
            </CardHeader>
            <div style={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.6 : 1 }}>
              {formComponent}
            </div>
          </Card>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        isConfirming={isConfirming}
        email={email}
        code={confirmationCode}
        setCode={setConfirmationCode}
        error={modalError}
        onConfirm={handleConfirm}
        onBack={handleBackFromModal}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
        onStartOver={handleStartOver}
      />
    </>
  );
}
