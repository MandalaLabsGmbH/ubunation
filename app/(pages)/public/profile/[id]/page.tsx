import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import PublicProfilePageClient from "@/app/components/user/profile/PublicProfilePageClient";
import axios from 'axios';
import { User } from "@/app/contexts/UserContext";

// --- Type Definitions for API Data ---

// Represents the public-facing user data
interface PublicUser {
    userId: number;
    username: string;
    profilePictureUrl: string; // From profileImg or a default
}

// Represents the basic collectible data
interface Collectible {
    collectibleId: number;
    name: { en: string; de: string; };
    imageRef: { url: string; };
}

// Represents a user's specific instance of a collectible
interface UserCollectible {
    userCollectibleId: number;
    collectibleId: number;
    ownerId: number;
    mint: number;
    createdDt: string;
}

// Represents the final, combined data structure passed to the client component
interface EnrichedUserCollectible {
    userCollectibleId: number;
    mint: number;
    createdDt: string;
    collectible: Collectible;
}

// --- Type Definition for Page Props ---
type PageProps = {
  params: { id: string };
};

// --- Custom Session Type Definition ---
// FIX: Extend the default Session type to include the custom idToken property.
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

        if (!userCollectibles || userCollectibles.length === 0) {
            return [];
        }

        const enrichedItems = await Promise.all(
            userCollectibles.map(async (item) => {
                try {
                    const collectibleRes = await axios.get<Collectible>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                        params: { collectibleId: item.collectibleId },
                    });

                    if (!collectibleRes.data) return null;

                    return {
                        userCollectibleId: item.userCollectibleId,
                        mint: item.mint,
                        createdDt: item.createdDt,
                        collectible: collectibleRes.data,
                    };

                } catch (enrichError) {
                    console.error(`Failed to enrich user collectible item ${item.userCollectibleId}:`, enrichError);
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

export default async function PublicProfilePage({ params }: PageProps) {
    // FIX: Cast the session to our custom type to make TypeScript aware of idToken.
    const session = await getServerSession(authOptions) as SessionWithToken | null;
    const { id } = await params;

    const publicUser = await getPublicUser(id);

    if (!publicUser) {
        return <div className="container mx-auto py-12">User not found.</div>;
    }

    const allUserCollectibles = await getUserCollectibles(publicUser.userId);

    const sortedItems = allUserCollectibles.sort((a, b) => {
        const dateA = new Date(a.createdDt).getTime();
        const dateB = new Date(b.createdDt).getTime();
        return dateB - dateA; // Sort descending (most recent first)
    });

    const mostRecentCollectible = sortedItems.length > 0 ? sortedItems[0] : null;
    const recentCollectibles = sortedItems.slice(0, 4);
    
    let isCurrentUser = false;
    if (session?.user?.email && session.idToken) {
        try {
            const userResponse = await axios.get<User>(`${API_BASE_URL}/User/getUserByEmail`, {
                params: { email: session.user.email },
                headers: { 'Authorization': `Bearer ${session.idToken}` }
            });
            const currentUserId = userResponse.data.userId;
            if (currentUserId && publicUser.userId === currentUserId) {
                isCurrentUser = true;
            }
        } catch (error) {
            // This is not a critical error, so we can just log it.
            console.error("Could not determine if the viewer is the current user:", error);
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

