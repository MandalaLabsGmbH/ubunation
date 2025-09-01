import UserCollectibleTemplate from '@/app/components/user/userCollectible/UserCollectibleTemplate';
import { notFound, redirect } from 'next/navigation';
import axios from 'axios';
import { getServerSession, Session } from 'next-auth'; // Import the Session type
import { authOptions } from '@/lib/auth';

// --- Type Definitions for API Data ---
interface UserCollectibleDetails {
  userCollectible: {
    mint: number;
    userCollectibleId: number;
    collectibleId: number;
    ownerId: number;
  };
  collectible: {
    collectibleId: number;
    name: { en: string; de: string; };
    description: { en: string; de: string; };
    imageRef?: { url: string; };
  };
  owner: {
    userId: number;
    username?: string;
  };
}

// --- Type Definition for Page Props ---
type PageProps = {
  params: Promise<{ id: string }>;
};

// --- Custom Session Type Definition ---
// Extend the default Session type to include the custom idToken property.
interface SessionWithToken extends Session {
  idToken?: string;
}

// --- Server-Side Data Fetching Function ---
async function getDetails(id: string, token: string | undefined): Promise<UserCollectibleDetails | null> {
    if (!token) {
        console.error("No auth token provided for getDetails");
        return null;
    }
    try {
        const authHeader = { 'Authorization': `Bearer ${token}` };

        const userCollectibleResponse = await axios.get<UserCollectibleDetails['userCollectible'][]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
            params: { userCollectibleId: id },
            headers: authHeader
        });

        const userCollectible = userCollectibleResponse.data[0];
        if (!userCollectible) {
            throw new Error('User collectible not found');
        }

        const [collectibleResponse, ownerResponse] = await Promise.all([
            axios.get<UserCollectibleDetails['collectible']>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                params: { collectibleId: userCollectible.collectibleId },
                headers: authHeader
            }),
            axios.get<UserCollectibleDetails['owner']>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/User/getUserByUserId`, {
                params: { userId: userCollectible.ownerId },
                headers: authHeader
            })
        ]);

        return {
            userCollectible: userCollectible,
            collectible: collectibleResponse.data,
            owner: ownerResponse.data
        };

    } catch (error) {
        console.error("Error fetching user collectible details:", error);
        return null;
    }
}

// --- Main Page Component ---
export default async function UserCollectiblePage({ params }: PageProps) {
    // Cast the session to our custom type to make TypeScript aware of idToken.
    const session = await getServerSession(authOptions) as SessionWithToken | null;
    
    if (!session) {
        redirect('/');
    }

    const { id } = await params;
    // Now we can safely access session.idToken without a TypeScript error.
    const details = await getDetails(id, session.idToken);

    if (!details || !details.collectible || !details.userCollectible || !details.owner) {
        notFound();
    }

    return (
        <UserCollectibleTemplate details={details} />
    );
}

