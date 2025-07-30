'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// This is a Higher-Order Component (HOC) that wraps protected pages.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function withAuth(Component: React.ComponentType<any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function AuthenticatedComponent(props: any) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      // If the session is loading, we don't do anything yet.
      if (status === 'loading') return;

      // If there is no session, redirect the user to the home page.
      if (!session) {
        router.push('/');
      }
    }, [session, status, router]);

    // While the session is loading, show a spinner.
    if (status === 'loading' || !session) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      );
    }

    // If the user is authenticated, render the component they were trying to access.
    return <Component {...props} />;
  };
}
