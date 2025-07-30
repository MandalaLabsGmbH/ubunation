import CampaignTemplate from '@/app/components/CampaignTemplate';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

// Define a type for a single collectible, reflecting your specific data structure
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

// The Fix: Both 'params' and 'searchParams' must be typed as Promises
// to match the requirements of newer Next.js versions for async pages.
type CampaignPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

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

// Apply the new type and await the params inside the function.
export default async function CampaignPage({ params }: CampaignPageProps) {
    // Await the params Promise to get the actual ID.
    const { id } = await params;
    const collectible = await getCollectible(id);

    // Ensure the collectible and its essential, language-specific fields exist
    if (!collectible || !collectible.imageRef?.img || !collectible.name?.en) {
        notFound();
    }

    // Pass the entire 'collectible' object as a single prop.
    return (
        <CampaignTemplate collectible={collectible} />
    );
}
