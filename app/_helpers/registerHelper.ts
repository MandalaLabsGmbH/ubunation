import { 
    signUp, 
    confirmSignUp, 
    signIn, 
    confirmSignIn,
    fetchAuthSession,
    resendSignUpCode
    // AuthFlowType has been removed from the import as it's not exported
} from 'aws-amplify/auth';

// --- Registration Functions using Amplify ---

export function cognitoRegister(email: string, password: string, clientMetadata?: Record<string, string>) {
    console.log('test1');
    return signUp({
        username: email,
        password,
        options: {
            userAttributes: { email },
            clientMetadata
        }
    });
}

export function cognitoConfirm(email: string, confirmCode: string, clientMetadata?: Record<string, string>) {
    return confirmSignUp({ 
        username: email, 
        confirmationCode: confirmCode,
        options: {
            clientMetadata // Pass the metadata here
        }
    });
}

export function cognitoResendConfirmation(email: string) {
    console.log('test3');
    return resendSignUpCode({ username: email });
}
// --- Email Login Functions using Amplify ---

export async function cognitoInitiateEmailLogin(email: string) {
    // The fix is to use the string literal 'CUSTOM_AUTH' directly.
    console.log('test4');
    const { nextStep } = await signIn({ 
        username: email,
        options: {
            authFlowType: 'CUSTOM_WITHOUT_SRP'
        }
    });
    console.log('test5');
    if (nextStep.signInStep !== 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
        throw new Error(`Unexpected sign-in step: ${nextStep.signInStep}`);
    }
}

export async function cognitoCompleteEmailLogin(code: string) {
    const { isSignedIn } = await confirmSignIn({ challengeResponse: code });
    console.log('test6');
    if (isSignedIn) {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        console.log('test7');
        if (!idToken) {
            throw new Error("Could not retrieve ID token from session.");
        }
        return idToken;
    }
    throw new Error("Sign in was not completed successfully.");
}