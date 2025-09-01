import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CollectiblesGrid from "@/app/components/user/collectibles/CollectiblesGrid";
import axios from 'axios';

// --- Type Definitions for API Data ---

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
}

// Represents the final, combined data structure passed to the client component
interface EnrichedUserCollectible {
    userCollectibleId: number;
    mint: number;
    collectible: Collectible;
}

// --- Server-Side Data Fetching Function ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMyCollectibles(session: any): Promise<EnrichedUserCollectible[]> {
    // Ensure we have a session and the necessary tokens/email
    if (!session?.user?.email || !session.idToken) {
        console.error("Authentication details are missing from the session.");
        return [];
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const token = session.idToken;
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    try {
        // 1. Get the internal user ID from the backend using the email
        const userResponse = await axios.get(`${API_BASE_URL}/User/getUserByEmail`, {
            params: { email: session.user.email },
            ...config
        });
        const userId = userResponse.data.userId;

        if (!userId) {
            console.error("User not found in the database.");
            return [];
        }

        // 2. Fetch all UserCollectible objects owned by this user
        const userCollectiblesResponse = await axios.get<UserCollectible[]>(`${API_BASE_URL}/UserCollectible/getUserCollectiblesByOwnerId`, {
            params: { ownerId: userId },
            ...config
        });
        const userCollectibles = userCollectiblesResponse.data;

        if (!userCollectibles || userCollectibles.length === 0) {
            return []; // The user doesn't own any collectibles yet
        }

        // 3. Enrich each UserCollectible with its full Collectible details
        const enrichedCollectibles = await Promise.all(
            userCollectibles.map(async (userCollectible) => {
                try {
                    const collectibleResponse = await axios.get<Collectible>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                        params: { collectibleId: userCollectible.collectibleId },
                        ...config
                    });
                    // Combine the data into our final structure
                    return {
                        userCollectibleId: userCollectible.userCollectibleId,
                        mint: userCollectible.mint,
                        collectible: collectibleResponse.data
                    };
                } catch (enrichError) {
                    console.error(`Failed to enrich userCollectible ${userCollectible.userCollectibleId}:`, enrichError);
                    return null; // Return null for failed enrichments
                }
            })
        );

        // Filter out any items that failed to enrich
        return enrichedCollectibles.filter((item): item is EnrichedUserCollectible => item !== null);

    } catch (error) {
        console.error("Error in getMyCollectibles:", error);
        return [];
    }
}

// --- Main Page Component ---

export default async function MyCollectiblesPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/');
    }

    const myCollectibles = await getMyCollectibles(session);

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-center mb-12">My Collectibles</h1>
            <CollectiblesGrid collectibles={myCollectibles} />
        </main>
    );
}
