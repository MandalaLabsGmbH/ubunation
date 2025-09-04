import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilePageClient from "@/app/components/user/profile/ProfilePageClient";
import axios from 'axios';
import { User } from "@/app/contexts/UserContext";
import { Suspense } from "react";

// --- Type Definitions (no change) ---

interface Purchase {
    purchaseId: number;
}
interface BasePurchaseItem {
    purchaseItemId: number;
    purchaseId: number;
    createdDt: string;
    purchasedUserItemId: number;
    itemId: number;
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
interface EnrichedPurchaseItem {
    purchaseItemId: number;
    purchaseId: number;
    createdDt: string;
    purchasedUserItemId: number;
    itemId: number;
    collectible: CollectibleDetails;
    userCollectible: UserCollectibleDetails;
}

// --- Data Fetching Functions (no change) ---

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
        const purchasesResponse = await axios.get<Purchase[]>(`${API_BASE_URL}/Purchase/getPurchasesByUserId`, {
            params: { userId }, ...config
        });
        const userPurchases = purchasesResponse.data;
        if (!userPurchases || userPurchases.length === 0) return [];

        const itemPromises = userPurchases.map(purchase =>
            axios.get<BasePurchaseItem[]>(`${API_BASE_URL}/PurchaseItem/getPurchaseItemsByPurchaseId`, {
                params: { purchaseId: purchase.purchaseId }, ...config
            }).then(res => res.data)
        );
        const nestedItems = await Promise.all(itemPromises);
        const allItems = nestedItems.flat();

        const enrichedItems = await Promise.all(
            allItems.map(async (item) => {
                try {
                    const [collectibleRes, userCollectibleRes] = await Promise.all([
                        axios.get<CollectibleDetails>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                            params: { collectibleId: item.itemId }, ...config
                        }),
                        axios.get<UserCollectibleDetails[]>(`${API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
                            params: { userCollectibleId: item.purchasedUserItemId }, ...config
                        })
                    ]);
                    const userCollectibleData = userCollectibleRes.data[0];
                    if (!collectibleRes.data || !userCollectibleData) return null;

                    return { ...item, collectible: collectibleRes.data, userCollectible: userCollectibleData };
                } catch (enrichError) {
                    console.error(`Failed to enrich purchase item ${item.purchaseItemId}:`, enrichError);
                    return null;
                }
            })
        );
        
        return enrichedItems.filter((item): item is EnrichedPurchaseItem => item !== null);

    } catch (error) {
        console.error("Failed to fetch and enrich purchase items:", error);
        return [];
    }
}

// --- NEW: Skeleton Component for the loading state ---
function ProfilePageSkeleton() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <section className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
        <div className="text-left w-full md:w-2/3">
          <div className="h-12 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mt-3"></div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
          <div className="rounded-full bg-muted w-48 h-48"></div>
          <div className="mt-4 p-4 bg-card rounded-lg shadow-md w-full">
            <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-10 bg-muted rounded w-1/2 mx-auto mt-2"></div>
            <div className="mt-2 h-8 bg-muted rounded w-full"></div>
          </div>
          <div className="mt-4 w-full h-12 bg-muted rounded-full"></div>
        </div>
      </section>
      <section>
        <div className="h-9 bg-muted rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full bg-card rounded-lg overflow-hidden">
                <div className="w-full h-56 bg-muted"></div>
                <div className="bg-muted h-8 w-full"></div>
                <div className="p-4"><div className="h-4 bg-muted rounded w-3/4 mx-auto"></div></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


// --- NEW: Async Component for Data Fetching ---
// This component now contains the slow data fetching logic.
async function ProfileData() {
    const session = await getServerSession(authOptions);
    // Session is already checked in the parent, but we need it for data fetching
    if (!session) return null;

    const user = await getUser(session);
    if (!user || !user.userId) {
        return <div className="container mx-auto py-12">Could not load user profile.</div>;
    }

    const allPurchaseItems = await getPurchaseItems(session, user.userId);
    const sortedItems = allPurchaseItems.sort((a, b) => new Date(b.userCollectible.createdDt).getTime() - new Date(a.userCollectible.createdDt).getTime());
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

// --- Main Page Component (Now using Suspense) ---
export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/');
    }

    return (
        <Suspense fallback={<ProfilePageSkeleton />}>
            <ProfileData />
        </Suspense>
    );
}