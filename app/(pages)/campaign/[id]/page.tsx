import CampaignTemplate from '@/app/components/CampaignTemplate';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

// Define a type for a single collectible, reflecting the multilingual structure
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

// This function now calls our new, dedicated API route
async function getCollectible(id: string): Promise<Collectible | null> {
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/db/collectible?collectibleId=${id}`, {
            headers: new Headers(await headers()),
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

// The Fix: Remove the custom PageProps interface and type the props directly.
export default async function CampaignPage({ params }: { params: { id: string } }) {
    const collectible = await getCollectible(params.id);

    // Ensure the collectible and its essential, language-specific fields exist
    if (!collectible || !collectible.imageRef?.img || !collectible.name?.en) {
        notFound();
    }

    // Pass the entire 'collectible' object as a single prop.
    return (
        <CampaignTemplate collectible={collectible} />
    );
}
