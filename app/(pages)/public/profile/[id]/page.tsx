import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import PublicProfilePageClient from "@/app/components/user/profile/PublicProfilePageClient";
import axios from 'axios';
import { User } from "@/app/contexts/UserContext";
import { Suspense } from "react";

// --- Type Definitions (no change) ---
interface PublicUser { userId: number; username: string; profilePictureUrl: string; }
interface Collectible { collectibleId: number; name: { en: string; de: string; }; imageRef: { url: string; }; }
interface UserCollectible { userCollectibleId: number; collectibleId: number; ownerId: number; mint: number; createdDt: string; }
interface EnrichedUserCollectible { userCollectibleId: number; mint: number; createdDt: string; collectible: Collectible; }
type PageProps = { params: { id: string }; };
interface SessionWithToken extends Session { idToken?: string; }

// --- Data Fetching Functions (no change) ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getPublicUser(userId: string): Promise<PublicUser | null> {
    if (!userId) return null;
    try {
        const res = await axios.get<PublicUser>(`${API_BASE_URL}/User/getPublicUserByUserId`, { params: { userId } });
        return res.data;
    } catch (error) { console.error("Failed to fetch public user:", error); return null; }
}

async function getUserCollectibles(userId: number): Promise<EnrichedUserCollectible[]> {
    if (!userId) return [];
    try {
        const userCollectiblesResponse = await axios.get<UserCollectible[]>(`${API_BASE_URL}/UserCollectible/getUserCollectiblesByOwnerId`, { params: { ownerId: userId } });
        const userCollectibles = userCollectiblesResponse.data;
        if (!userCollectibles || userCollectibles.length === 0) { return []; }

        const enrichedItems = await Promise.all(
            userCollectibles.map(async (item) => {
                try {
                    const collectibleRes = await axios.get<Collectible>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, { params: { collectibleId: item.collectibleId } });
                    if (!collectibleRes.data) return null;
                    return { userCollectibleId: item.userCollectibleId, mint: item.mint, createdDt: item.createdDt, collectible: collectibleRes.data };
                } catch (enrichError) { console.error(`Failed to enrich user collectible item ${item.userCollectibleId}:`, enrichError); return null; }
            })
        );
        return enrichedItems.filter((item): item is EnrichedUserCollectible => item !== null);
    } catch (error) { console.error("Failed to fetch and enrich user collectibles:", error); return []; }
}

// --- NEW: Skeleton Component ---
function PublicProfilePageSkeleton() {
    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
            <section className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
                <div className="text-left w-full md:w-2/3">
                    <div className="h-14 bg-muted rounded w-3/4"></div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                    <div className="rounded-full bg-muted w-48 h-48"></div>
                    <div className="mt-4 p-4 bg-card rounded-lg shadow-md w-full">
                        <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
                        <div className="h-10 bg-muted rounded w-1/2 mx-auto mt-2"></div>
                    </div>
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

// --- NEW: Async Data Component ---
async function PublicProfileData({ id }: { id: string }) {
    const session = await getServerSession(authOptions) as SessionWithToken | null;
    const publicUser = await getPublicUser(id);

    if (!publicUser) {
        return <div className="container mx-auto py-12">User not found.</div>;
    }

    const allUserCollectibles = await getUserCollectibles(publicUser.userId);
    const sortedItems = allUserCollectibles.sort((a, b) => new Date(b.createdDt).getTime() - new Date(a.createdDt).getTime());
    const mostRecentCollectible = sortedItems.length > 0 ? sortedItems[0] : null;
    const recentCollectibles = sortedItems.slice(0, 4);
    
    let isCurrentUser = false;
    if (session?.user?.email && session.idToken) {
        try {
            const userResponse = await axios.get<User>(`${API_BASE_URL}/User/getUserByEmail`, {
                params: { email: session.user.email }, headers: { 'Authorization': `Bearer ${session.idToken}` }
            });
            const currentUserId = userResponse.data.userId;
            if (currentUserId && publicUser.userId === currentUserId) {
                isCurrentUser = true;
            }
        } catch (error) { console.error("Could not determine if the viewer is the current user:", error); }
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

// --- Main Page Component (now using Suspense) ---
export default async function PublicProfilePage({ params }: PageProps) {
    const { id } = params;
    return (
        <Suspense fallback={<PublicProfilePageSkeleton />}>
            <PublicProfileData id={id} />
        </Suspense>
    );
}