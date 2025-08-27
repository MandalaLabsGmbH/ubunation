import { headers } from 'next/headers';
import HomePageClient from '@/app/components/HomePageClient';

// Define the type for a single collectible with multilingual name and description
interface Collectible {
  collectibleId: number;
  name: { en: string; de: string; };
  description: { en: string; de: string; };
  imageRef?: {
    url: string;
    img: string;
  };
}

// Define the type for the new recently purchased data
interface RecentPurchase {
  mint: number;
  userCollectibleId: number;
  collectible: {
    name: { en: string; de: string; };
    imageRef?: {
      url: string;
      img: string;
    };
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

async function getRecentPurchases(): Promise<RecentPurchase[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/db/userCollectible?getMostRecent=true`, {
      method: 'GET',
      cache: 'no-store' // Ensure we always get the latest data
    });

    if (!response.ok) {
      console.error(`Failed to fetch recent purchases:`, await response.text());
      return [];
    }
    return response.json();
  } catch (error) {
    console.error(`Error in getRecentPurchases:`, error);
    return [];
  }
}

export default async function UBUNΛTIONRootPage() {
  // Fetch all data in parallel for better performance
  const [
    allCollectibles,
    recentPurchases
  ] = await Promise.all([
    getAllCollectibles(),
    getRecentPurchases()
  ]);
  
  const heroCollectible: Collectible | null = allCollectibles.length > 0 ? allCollectibles[0] : null;
  const featuredCollectibles = allCollectibles.slice(1, 4);

  return (
    <HomePageClient 
      heroCollectible={heroCollectible} 
      featuredCollectibles={featuredCollectibles}
      recentPurchases={recentPurchases}
    />
  );
}
