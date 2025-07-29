import { headers } from 'next/headers';
import HomePageClient from '@/app/components/HomePageClient'; // Import the new Client Component

// Define the type for a single collectible
interface Collectible {
  collectibleId: number;
  name: { en: string };
  description: { en: string };
  imageRef?: {
    url: string;
  };
}

// This server-side function fetches all collectibles.
async function getAllCollectibles(): Promise<Collectible[]> {
  try {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get('cookie');
    const apiHeaders = new Headers();
    if (cookie) {
      apiHeaders.append('Cookie', cookie);
    }
    
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/db/collectible`, {
      method: 'GET',
      headers: apiHeaders,
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Failed to fetch all collectibles:`, await response.text());
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error in getAllCollectibles:`, error);
    return [];
  }
}

// This is your main page component, which remains a Server Component.
export default async function UBUNΛTIONRootPage() {
  // Fetch all data on the server
  const allCollectibles: Collectible[] = await getAllCollectibles();
  
  const heroCollectible: Collectible | null = allCollectibles.length > 0 ? allCollectibles[0] : null;
  const featuredCollectibles = allCollectibles.slice(1, 4);

  // Pass the server-fetched data as props to the Client Component
  return (
    <HomePageClient 
      heroCollectible={heroCollectible} 
      featuredCollectibles={featuredCollectibles} 
    />
  );
}
