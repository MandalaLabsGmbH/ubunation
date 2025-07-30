import CampaignTemplate from '@/app/components/CampaignTemplate';
import { notFound } from 'next/navigation';

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

// Define the standard props for a dynamic page component
type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// This function now calls our new, dedicated API route
async function getCollectible(id: string): Promise<Collectible | null> {
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/db/collectible?collectibleId=${id}`, {
            // The Fix: Remove the headers. They are not needed for fetching public data
            // and are the source of the build error.
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

// This is the most robust pattern for defining a dynamic page in Next.js
export default async function CampaignPage(props: PageProps) {
    const { params } = props;
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
