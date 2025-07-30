import { headers } from 'next/headers';
import HomePageClient from '@/app/components/HomePageClient';

// Define the type for a single collectible with multilingual name and description
interface Collectible {
  collectibleId: number;
  name: { en: string; de: string; };
  description: { en: string; de: string; };
  imageRef?: {
    url: string;
  };
}

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

export default async function UBUNΛTIONRootPage() {
  const allCollectibles: Collectible[] = await getAllCollectibles();
  
  const heroCollectible: Collectible | null = allCollectibles.length > 0 ? allCollectibles[0] : null;
  const featuredCollectibles = allCollectibles.slice(1, 4);

  return (
    <HomePageClient 
      heroCollectible={heroCollectible} 
      featuredCollectibles={featuredCollectibles} 
    />
  );
}
