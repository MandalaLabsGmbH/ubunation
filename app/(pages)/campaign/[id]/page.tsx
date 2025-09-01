import CampaignTemplate from '@/app/components/CampaignTemplate';
import { notFound } from 'next/navigation';
import axios from 'axios';

// --- Type Definitions for API Data ---
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

// --- Type Definition for Page Props ---
// This type correctly defines `params` as a Promise, which matches what your build environment expects.
type CampaignPageProps = {
  params: Promise<{ id: string }>;
};

// --- Server-Side Data Fetching Function ---
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

// --- Main Page Component ---
export default async function CampaignPage({ params }: CampaignPageProps) {
    // Await the params Promise to get the actual ID.
    const { id } = await params;
    const collectible = await getCollectible(id);

    // Ensure the collectible and its essential fields exist
    if (!collectible || !collectible.imageRef?.img || !collectible.name?.en) {
        notFound();
    }

    // Pass the entire 'collectible' object as a single prop.
    return (
        <CampaignTemplate collectible={collectible} />
    );
}

