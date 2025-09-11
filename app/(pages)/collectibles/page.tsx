import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import axios from 'axios';
import { Suspense } from "react";
import CollectiblesPageClient from "../../components/CollectiblesPageClient";

// --- Type Definitions ---
interface Collectible {
    collectibleId: number;
    name: { en: string; de: string; };
    imageRef: { url: string; };
}
interface UserCollectible {
    userCollectibleId: number;
    collectibleId: number;
    ownerId: number;
    mint: number;
}
interface EnrichedUserCollectible {
    userCollectibleId: number;
    mint: number;
    collectible: Collectible;
}

// --- Data Fetching Function ---
async function getMyCollectibles(session: { user?: { email?: string }; idToken?: string }): Promise<EnrichedUserCollectible[]> {
    if (!session?.user?.email || !session.idToken) {
        console.error("Authentication details are missing from the session.");
        return [];
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const token = session.idToken;
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    try {
        const userResponse = await axios.get(`${API_BASE_URL}/User/getUserByEmail`, {
            params: { email: session.user.email }, ...config
        });
        const userId = userResponse.data.userId;
        if (!userId) { return []; }

        const userCollectiblesResponse = await axios.get<UserCollectible[]>(`${API_BASE_URL}/UserCollectible/getUserCollectiblesByOwnerId`, {
            params: { ownerId: userId }, ...config
        });
        const userCollectibles = userCollectiblesResponse.data;
        if (!userCollectibles || userCollectibles.length === 0) { return []; }

        const enrichedCollectibles = await Promise.all(
            userCollectibles.map(async (userCollectible) => {
                try {
                    const collectibleResponse = await axios.get<Collectible>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                        params: { collectibleId: userCollectible.collectibleId }, ...config
                    });
                    return {
                        userCollectibleId: userCollectible.userCollectibleId,
                        mint: userCollectible.mint,
                        collectible: collectibleResponse.data
                    };
                } catch (enrichError) {
                    console.error(`Failed to enrich userCollectible ${userCollectible.userCollectibleId}:`, enrichError);
                    return null;
                }
            })
        );
        return enrichedCollectibles.filter((item): item is EnrichedUserCollectible => item !== null);
    } catch (error) {
        console.error("Error in getMyCollectibles:", error);
        return [];
    }
}

// --- Skeleton Component for the loading state ---
function MyCollectiblesSkeleton() {
    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
            <div className="h-9 w-1/3 bg-muted rounded mx-auto mb-12"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="aspect-square w-full bg-muted rounded-lg"></div>
                ))}
            </div>
        </main>
    );
}

// --- Async Server Component for Data Fetching ---
async function CollectiblesData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const myCollectibles = await getMyCollectibles(session as { user?: { email?: string }; idToken?: string });

    // Pass server-fetched data as a prop to the Client Component
    return <CollectiblesPageClient collectibles={myCollectibles} />;
}


// --- Main Page Component (Now using Suspense) ---
export default async function MyCollectiblesPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/');
    }

    return (
        <Suspense fallback={<MyCollectiblesSkeleton />}>
            <CollectiblesData />
        </Suspense>
    );
}