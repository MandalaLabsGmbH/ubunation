import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { CognitoIdentityProviderClient, InitiateAuthCommand, AuthFlowType } from "@aws-sdk/client-cognito-identity-provider";
import process from 'process';

// This object is now in its own file and can be safely exported.
export const authOptions: AuthOptions = {
    secret: process.env.AUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Username" },
                password: { label: "Password", type: "text", placeholder: "Password" },
            },

            authorize: async (credentials) => {

                if (!credentials) return null;

                const cognito = new CognitoIdentityProviderClient({
                    region: process.env.COGNITO_REGION,
                });

                const params = {
                    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
                    ClientId: process.env.CLIENT_ID!,
                    AuthParameters: {
                        USERNAME: credentials.username,
                        PASSWORD: credentials.password,
                    },
                };

                try {
                    const command = new InitiateAuthCommand(params);
                    const cognitoResponse = await cognito.send(command);
                    
                    if (cognitoResponse.AuthenticationResult) {
                    return {
                        id: credentials.username,
                        name: credentials.username,
                        email: credentials.username,
                        ...cognitoResponse.AuthenticationResult,
                    };
                }
                    return null;
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.idToken = user.IdToken;
                token.accessToken = user.AccessToken;
                token.refreshToken = user.RefreshToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.accessToken = token.accessToken as string;
            }
            return session;
        }
    },
    pages: {
        signIn:  "/"
    },
};
