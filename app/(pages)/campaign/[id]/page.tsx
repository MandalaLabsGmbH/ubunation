import CampaignTemplate from '@/app/components/CampaignTemplate';
import { notFound } from 'next/navigation';

// Define a type for a single collectible, reflecting the multilingual structure
interface Collectible {
  collectibleId: number;
  name: { en: string; de: string; };
  description: { en: string; de: string; };
  imageRef?: {
    url: string;
  };
}

async function getCollectible(id: string): Promise<Collectible | null> {
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/db/collectible?collectibleId=${id}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`Failed to fetch collectible ${id}:`, await res.text());
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching collectible:", error);
        return null;
    }
}

export default async function CampaignPage({ params }: { params: { id: string } }) {
    const collectible = await getCollectible(params.id);

    // Ensure the collectible and its essential, language-specific fields exist
    if (!collectible || !collectible.imageRef?.url || !collectible.name?.en) {
        notFound();
    }

    // The Fix: Pass the entire 'collectible' object as a single prop.
    // This matches what the CampaignTemplate component now expects.
    return (
        <CampaignTemplate collectible={collectible} />
    );
}
