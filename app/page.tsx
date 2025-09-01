// app/page.tsx

import HomePageClient from '@/app/components/HomePageClient';
import axios from 'axios';

// Define the types for your data
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

interface UserCollectible {
  userCollectibleId: number;
  collectibleId: number;
};

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getAllCollectibles(): Promise<Collectible[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/Collectible/getAllCollectibles`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error in getAllCollectibles:`, error);
    return [];
  }
}

async function getAllCollections(): Promise<Collection[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/Collection/getAllCollections`, {
      params: { limit: 2 }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error in getAllCollections:`, error);
    return [];
  }
}

async function getRecentPurchases(): Promise<RecentPurchase[]> {
    try {
        const response = await axios.get(`${API_BASE_URL}/UserCollectible/getUserCollectiblesByLastOwned`, {
            params: {
                start_date: new Date().toISOString(),
                limit: 5,
            }
        });

        const recentUserCollectibles = response.data;
        if (!recentUserCollectibles || recentUserCollectibles.length === 0) {
            return [];
        }

        const enrichedCollectibles = await Promise.all(
            recentUserCollectibles.map(async (userCollectible: UserCollectible) => {
                try {
                    const collectibleResponse = await axios.get(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                        params: { collectibleId: userCollectible.collectibleId }
                    });
                    return { ...userCollectible, collectible: collectibleResponse.data };
                } catch (enrichError) {
                    console.error(`Failed to enrich recent userCollectible ${userCollectible.userCollectibleId}:`, enrichError);
                    return null;
                }
            })
        );

        return enrichedCollectibles.filter(item => item !== null);

    } catch (error) {
        console.error(`Error in getRecentPurchases:`, error);
        return [];
    }
}


export default async function UBUNΛTIONRootPage() {
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