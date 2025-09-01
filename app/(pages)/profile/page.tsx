import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilePageClient from "@/app/components/user/profile/ProfilePageClient";
import axios from 'axios';
import { User } from "@/app/contexts/UserContext"; // Import User type from context

// --- Type Definitions for API Data ---

interface Purchase {
    purchaseId: number;
    // ... other purchase properties
}

interface BasePurchaseItem {
    purchaseItemId: number;
    purchaseId: number;
    createdDt: string;
    purchasedUserItemId: number; // ID of the UserCollectible
    itemId: number; // ID of the Collectible
}

interface CollectibleDetails {
    collectibleId: number;
    name: { en: string; de: string };
    imageRef: { url: string };
}

interface UserCollectibleDetails {
    userCollectibleId: number;
    mint: number;
    createdDt: string;
}

// The final, fully enriched data structure for a single purchased item
interface EnrichedPurchaseItem {
    purchaseItemId: number;
    purchaseId: number;
    createdDt: string;
    purchasedUserItemId: number; // ID of the UserCollectible
    itemId: number; // ID of the Collectible
    collectible: CollectibleDetails;
    userCollectible: UserCollectibleDetails;
}


// --- Server-Side Data Fetching Functions ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUser(session: any): Promise<User | null> {
    if (!session?.user?.email || !session.idToken) return null;
    try {
        const res = await axios.get<User>(`${API_BASE_URL}/User/getUserByEmail`, {
            params: { email: session.user.email },
            headers: { 'Authorization': `Bearer ${session.idToken}` }
        });
        return res.data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPurchaseItems(session: any, userId: number): Promise<EnrichedPurchaseItem[]> {
    if (!session.idToken) return [];
    
    const config = { headers: { 'Authorization': `Bearer ${session.idToken}` } };

    try {
        // 1. Get all of the user's purchases
        const purchasesResponse = await axios.get<Purchase[]>(`${API_BASE_URL}/Purchase/getPurchasesByUserId`, {
            params: { userId },
            ...config
        });
        const userPurchases = purchasesResponse.data;
        if (!userPurchases || userPurchases.length === 0) return [];

        // 2. For each purchase, get its associated items
        const itemPromises = userPurchases.map(purchase =>
            axios.get<BasePurchaseItem[]>(`${API_BASE_URL}/PurchaseItem/getPurchaseItemsByPurchaseId`, {
                params: { purchaseId: purchase.purchaseId },
                ...config
            }).then(res => res.data)
        );
        const nestedItems = await Promise.all(itemPromises);
        const allItems = nestedItems.flat();

        // 3. Enrich each item with full collectible and user collectible details
        const enrichedItems = await Promise.all(
            allItems.map(async (item) => {
                try {
                    const [collectibleRes, userCollectibleRes] = await Promise.all([
                        axios.get<CollectibleDetails>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                            params: { collectibleId: item.itemId },
                            ...config
                        }),
                        axios.get<UserCollectibleDetails[]>(`${API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
                            params: { userCollectibleId: item.purchasedUserItemId },
                            ...config
                        })
                    ]);
                    // The user collectible endpoint returns an array, so we take the first element
                    const userCollectibleData = userCollectibleRes.data[0];

                    if (!collectibleRes.data || !userCollectibleData) return null;

                    return {
                        ...item,
                        collectible: collectibleRes.data,
                        userCollectible: userCollectibleData
                    };
                } catch (enrichError) {
                    console.error(`Failed to enrich purchase item ${item.purchaseItemId}:`, enrichError);
                    return null;
                }
            })
        );
        
        // Filter out any items that failed to enrich
        return enrichedItems.filter((item): item is EnrichedPurchaseItem => item !== null);

    } catch (error) {
        console.error("Failed to fetch and enrich purchase items:", error);
        return [];
    }
}

// --- Main Page Component ---

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/');
    }

    const user = await getUser(session);

    if (!user || !user.userId) {
        return <div className="container mx-auto py-12">Could not load user profile.</div>;
    }

    const allPurchaseItems = await getPurchaseItems(session, user.userId);

    const sortedItems = allPurchaseItems.sort((a, b) => {
        const dateA = new Date(a.userCollectible.createdDt).getTime();
        const dateB = new Date(b.userCollectible.createdDt).getTime();
        return dateB - dateA; // Sort descending (most recent first)
    });

    const mostRecentPurchaseItem = sortedItems.length > 0 ? sortedItems[0] : null;
    const recentCollectibles = sortedItems.slice(0, 4);

    return (
        <ProfilePageClient
            user={user}
            totalCollectibles={allPurchaseItems.length}
            mostRecentPurchaseItem={mostRecentPurchaseItem}
            recentCollectibles={recentCollectibles}
        />
    );
}
