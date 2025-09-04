import CampaignTemplate from '@/app/components/CampaignTemplate';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { Suspense } from 'react';

// --- Type Definitions (no change) ---
interface Collectible {
  collectibleId: number;
  name: { en: string; de: string; };
  description: { en: string; de: string; };
  imageRef?: {
    url: string;
    img: string;
  };
  price?: { base: string };
}

type CampaignPageProps = {
  params: { id: string };
};

// --- Data Fetching Function (no change) ---
async function getCollectible(id: string): Promise<Collectible | null> {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
            params: { collectibleId: id }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching collectible:", error);
        return null;
    }
}

// --- NEW: Skeleton Component ---
function CampaignPageSkeleton() {
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
                    <div className="pt-10 flex gap-2">
                        <div className="w-full bg-muted h-14 rounded-full"></div>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-muted rounded-lg w-full p-8">
                        <div className="h-8 bg-muted/50 rounded w-1/3 mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-muted/50 rounded w-full"></div>
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
async function CampaignData({ id }: { id: string }) {
    const collectible = await getCollectible(id);

    if (!collectible || !collectible.imageRef?.img || !collectible.name?.en) {
        notFound();
    }

    return (
        <CampaignTemplate collectible={collectible} />
    );
}

// --- Main Page Component (now using Suspense) ---
export default async function CampaignPage({ params }: CampaignPageProps) {
    const { id } = params;
    return (
        <Suspense fallback={<CampaignPageSkeleton />}>
            <CampaignData id={id} />
        </Suspense>
    );
}