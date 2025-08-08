import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
      }
    }
  }, {
    ssr: true // Enable Server-Side Rendering support
  });
}