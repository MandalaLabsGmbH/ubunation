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

interface Collection {
  collectionId: number;
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

async function getAllCollections(): Promise<Collection[]> {
  try {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get('cookie');
    const apiHeaders = new Headers();
    if (cookie) {
      apiHeaders.append('Cookie', cookie);
    }
    
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/db/collection?limit=2`, {
      method: 'GET',
      headers: apiHeaders,
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Failed to fetch all collections:`, await response.text());
      return [];
    }
    const data = await response.json();
    console.log("HERE IS DAATA");
    console.log(data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error in getAllCollections:`, error);
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
    allCollections,
    recentPurchases
  ] = await Promise.all([
    getAllCollectibles(),
    getAllCollections(),
    getRecentPurchases()
  ]);
  const featuredCollectibles = allCollectibles.slice(1, 4);
  const featuredCollections = allCollections;

  return (
    <HomePageClient 
      featuredCollectibles={featuredCollectibles}
      featuredCollections={featuredCollections}
      recentPurchases={recentPurchases}
    />
  );
}
