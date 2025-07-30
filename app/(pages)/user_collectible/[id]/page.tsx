import UserCollectibleTemplate from '@/app/components/user/userCollectible/UserCollectibleTemplate';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

// Define a type for the combined data we expect from our new API route
interface UserCollectibleDetails {
  userCollectible: {
    mint: number;
    userCollectibleId: number;
  };
  collectible: {
    collectibleId: number;
    name: { en: string; de: string; };
    description: { en: string; de: string; };
    imageRef?: { url: string; };
  };
  owner: {
    userId: number;
    username?: string;
  };
}

// This function now calls our new, dedicated API route
async function getDetails(id: string): Promise<UserCollectibleDetails | null> {
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/db/user-collectible-details?id=${id}`, {
            headers: new Headers(await headers()),
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`Failed to fetch details for user collectible ${id}:`, await res.text());
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching user collectible details:", error);
        return null;
    }
}

// The Fix: Remove the custom PageProps interface and type the props directly.
export default async function UserCollectiblePage({ params }: { params: { id: string } }) {
    const details = await getDetails(params.id);

    // Ensure all necessary data was fetched successfully
    if (!details || !details.collectible || !details.userCollectible || !details.owner) {
        notFound();
    }

    // Pass the entire 'details' object as a single prop
    return (
        <UserCollectibleTemplate details={details} />
    );
}
