'use client'

import { useEffect, JSX } from 'react';
import { useAuthModal } from '@/app/contexts/AuthModalContext';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthForm } from '@/app//hooks/useAuthForm';
import { useTranslation } from '@/app/hooks/useTranslation';
import RegisterForm from '@/app/components/auth/RegisterForm';
import LoginPasswordForm from '@/app/components/auth/LoginPasswordForm';
import LoginEmailForm from '@/app/components/auth/LoginEmailForm';
import ConfirmationModal from '@/app/components/auth/ConfirmationModal';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { configureAmplify } from '@/lib/amplify-config';

export default function AuthModal() {
  const { translate } = useTranslation();
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
                {mode === 'register' && translate("authModal-createAccountTitle-1")}
                {mode === 'login-password' && translate("authModal-loginTitle-1")}
                {mode === 'login-email' && translate("authModal-loginTitle-1")}
              </CardTitle>
              <CardDescription className="text-center">
                {mode === 'register' && translate("authModal-createAccountDescription-1")}
                {mode === 'login-password' && translate("authModal-loginPasswordDescription-1")}
                {mode === 'login-email' && translate("authModal-loginEmailDescription-1")}
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
