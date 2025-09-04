import UserCollectibleTemplate from '@/app/components/user/userCollectible/UserCollectibleTemplate';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/app/contexts/UserContext';
import type { Metadata } from 'next';
import { Suspense } from 'react';

// --- Type Definitions (no change) ---
interface UserCollectibleDetails {
  userCollectible: { mint: number; userCollectibleId: number; collectibleId: number; ownerId: number; };
  collectible: { collectibleId: number; name: { en: string; de: string; }; description: { en: string; de: string; }; imageRef?: { url: string; }; };
  owner: { userId: number; username?: string; };
}
type PageProps = { params: { id: string }; };
interface SessionWithToken extends Session { idToken?: string; }

// --- Data Fetching Function (no change) ---
async function getDetails(id: string, session: SessionWithToken | null): Promise<UserCollectibleDetails | null> {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const userCollectibleResponse = await axios.get<UserCollectibleDetails['userCollectible'][]>(`${API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, { params: { userCollectibleId: id } });
        const userCollectible = userCollectibleResponse.data[0];
        if (!userCollectible) { throw new Error('User collectible not found'); }

        const collectibleResponse = await axios.get<UserCollectibleDetails['collectible']>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, { params: { collectibleId: userCollectible.collectibleId } });
        
        const ownerParams = { params: { userId: userCollectible.ownerId }, headers: session?.idToken ? { 'Authorization': `Bearer ${session.idToken}` } : {} };
        const ownerUrl = session?.idToken ? `${API_BASE_URL}/User/getUserByUserId` : `${API_BASE_URL}/User/getPublicUserByUserId`;
        const ownerResponse = await axios.get<UserCollectibleDetails['owner']>(ownerUrl, ownerParams);

        return { userCollectible: userCollectible, collectible: collectibleResponse.data, owner: ownerResponse.data };
    } catch (error) {
        console.error("Error fetching user collectible details:", error);
        return null;
    }
}

// --- Dynamic Metadata (no change) ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  const details = await getDetails(id, null);
  if (!details) { return { title: 'Collectible Not Found' }; }
  const { collectible, userCollectible } = details;
  const title = `${collectible.name.en} #${userCollectible.mint}`;
  const description = "I just donated to Ubunation and received this artwork. Come check it out!";
  const imageUrl = `${collectible.imageRef?.url}/${userCollectible.mint}.png`;
  const pageUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/user_collectible/${id}` : '';
  return { title, description, openGraph: { title, description, url: pageUrl, images: [{ url: imageUrl, width: 800, height: 800, alt: title, }], type: 'website' }, twitter: { card: 'summary_large_image', title, description, images: [imageUrl] } };
}

// --- NEW: Skeleton Component ---
function UserCollectiblePageSkeleton() {
    return (
         <div className="w-full max-w-7xl mx-auto py-8 px-4 animate-pulse">
            <div className="bg-muted h-20 rounded-lg mb-8"></div>
            <div className="border-b border-border mb-8">
                <div className="flex space-x-8">
                    <div className="h-12 w-24 bg-muted rounded-t-lg"></div>
                    <div className="h-12 w-24 bg-muted rounded-t-lg"></div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1">
                    <div className="bg-muted rounded-lg aspect-square"></div>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-muted rounded-lg w-full p-8">
                        <div className="h-6 bg-muted/50 rounded w-1/4 mb-2"></div>
                        <div className="h-8 bg-muted/50 rounded w-1/2 mb-6"></div>
                        <div className="h-8 bg-muted/50 rounded w-1/3 mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-muted/50 rounded w-full"></div>
                            <div className="h-4 bg-muted/50 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- NEW: Async Data Component ---
async function UserCollectibleData({ id }: { id: string }) {
    const session = await getServerSession(authOptions) as SessionWithToken | null;
    const details = await getDetails(id, session);

    if (!details || !details.collectible || !details.userCollectible || !details.owner) {
        notFound();
    }

    let isOwner = false;
    if (session?.user?.email && session.idToken) {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
            const userResponse = await axios.get<User>(`${API_BASE_URL}/User/getUserByEmail`, {
                params: { email: session.user.email },
                headers: { 'Authorization': `Bearer ${session.idToken}` }
            });
            const currentUserId = userResponse.data.userId;
            if (currentUserId && details.owner.userId === currentUserId) {
                isOwner = true;
            }
        } catch (error) {
            console.error("Could not determine ownership:", error);
        }
    }
    return <UserCollectibleTemplate details={details} isOwner={isOwner} />;
}

// --- Main Page Component (now using Suspense) ---
export default async function UserCollectiblePage({ params }: PageProps) {
    const { id } = params;
    return (
        <Suspense fallback={<UserCollectiblePageSkeleton />}>
            <UserCollectibleData id={id} />
        </Suspense>
    );
}