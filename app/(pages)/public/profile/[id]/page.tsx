import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import PublicProfilePageClient from "@/app/components/user/profile/PublicProfilePageClient";
import axios from 'axios';

// --- Type Definitions ---

interface User {
    userId?: number;
    username?: string;
    email: string;
    userType: 'onboarding' | 'email' | 'unregistered' | 'username' | 'admin';
    authData?: {
        firstName?: string;
        lastName?: string;
        country?: string;
        newsletter?: '1' | '0';
    };
}

interface PublicUser {
    userId: number;
    username: string;
    profilePictureUrl: string;
}

interface Collectible {
    collectibleId: number;
    name: { en: string; de: string; };
    description: { en: string; de: string; };
    imageRef: {
        url: string;
        img?: string;
     };
    price?: { base: string };
}

interface UserCollectible {
    userCollectibleId: number;
    collectibleId: number;
    ownerId: number;
    mint: number;
    createdDt: string;
}

interface EnrichedUserCollectible extends UserCollectible {
    collectible: Collectible;
}

interface SessionWithToken extends Session {
  idToken?: string;
}

// --- Server-Side Data Fetching Functions ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getPublicUser(userId: string): Promise<PublicUser | null> {
    if (!userId) return null;
    try {
        const res = await axios.get<PublicUser>(`${API_BASE_URL}/User/getPublicUserByUserId`, {
            params: { userId },
        });
        return res.data;
    } catch (error) {
        console.error("Failed to fetch public user:", error);
        return null;
    }
}

async function getUserCollectibles(userId: number): Promise<EnrichedUserCollectible[]> {
    if (!userId) return [];
    
    try {
        const userCollectiblesResponse = await axios.get<UserCollectible[]>(`${API_BASE_URL}/UserCollectible/getUserCollectiblesByOwnerId`, {
            params: { ownerId: userId },
        });
        const userCollectibles = userCollectiblesResponse.data;
        if (!userCollectibles || userCollectibles.length === 0) return [];

        const enrichedItems = await Promise.all(
            userCollectibles.map(async (item) => {
                try {
                    const collectibleRes = await axios.get<Collectible>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                        params: { collectibleId: item.collectibleId },
                    });
                    
                    if (!collectibleRes.data) return null;

                    return {
                        ...item,
                        collectible: collectibleRes.data,
                    };
                } catch (enrichError) {
                    console.error(`Failed to enrich user collectible ${item.userCollectibleId}:`, enrichError);
                    return null;
                }
            })
        );
        
        return enrichedItems.filter((item): item is EnrichedUserCollectible => item !== null);

    } catch (error) {
        console.error("Failed to fetch and enrich user collectibles:", error);
        return [];
    }
}

// --- Main Page Component ---

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions) as SessionWithToken | null;
    const { id } = params;

    const publicUser = await getPublicUser(id);

    if (!publicUser) {
        return <div className="container mx-auto py-12">User not found.</div>;
    }

    const allUserCollectibles = await getUserCollectibles(publicUser.userId);

    const sortedCollectibles = allUserCollectibles.sort((a, b) => {
        const dateA = new Date(a.createdDt).getTime();
        const dateB = new Date(b.createdDt).getTime();
        return dateB - dateA;
    });

    const mostRecentCollectible = sortedCollectibles.length > 0 ? sortedCollectibles[0] : null;
    const recentCollectibles = sortedCollectibles.slice(0, 4);
    
    let isCurrentUser = false;
    if (session?.user?.email && session.idToken) {
        try {
            const currentUser = (await axios.get<User>(`${API_BASE_URL}/User/getUserByEmail`, {
                params: { email: session.user.email },
                headers: { 'Authorization': `Bearer ${session.idToken}` }
            })).data;
            isCurrentUser = currentUser.userId === publicUser.userId;
        } catch (error) {
            console.error("Could not verify current user:", error);
        }
    }


    return (
        <PublicProfilePageClient
            publicUser={publicUser}
            totalCollectibles={allUserCollectibles.length}
            mostRecentCollectible={mostRecentCollectible}
            recentCollectibles={recentCollectibles}
            isCurrentUser={isCurrentUser}
        />
    );
}

