'use client'

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUser } from '@/app/contexts/UserContext';

export default function UserSessionManager() {
  const { data: session, status } = useSession();
  const { setUser } = useUser();

  useEffect(() => {
    const fetchUser = async (email: string) => {
      try {
        // This API route fetches the full user object from your database
        const res = await fetch(`/api/db/user?email=${email}`);
        if (res.ok) {
          const userData = await res.json();
          setUser(userData); // Update the global user context
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser(null);
      }
    };

    // When the session is authenticated, fetch the user's full details
    if (status === 'authenticated' && session.user?.email) {
      fetchUser(session.user.email);
    } 
    // When the user logs out, clear the user context
    else if (status === 'unauthenticated') {
      setUser(null);
    }

  }, [status, session, setUser]);

  // This component does not render anything itself
  return null;
}
