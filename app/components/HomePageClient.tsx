'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import NonUserButton from "@/app/components/NonUserButton";
import { useTranslation } from '@/app/hooks/useTranslation';
import CollectibleImage from './CollectibleImage';
import { useMediaQuery } from '@/app/hooks/useMediaQuery'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Loader2 } from 'lucide-react';

// --- Helper component for spinners ---
const SectionSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

// --- Type Definitions (no change) ---
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

interface RecentPurchase {
  mint: number;
  ownerId: number;
  username?: string;
  userCollectibleId: number;
  collectible: {
    name: { en: string; de: string; };
    imageRef?: {
      url: string;
      img: string;
    };
  };
}

// Component no longer receives props
export default function HomePageClient() {
  const { language } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [api, setApi] = useState<CarouselApi>()
  const isMobile = useMediaQuery('md');

  // --- State for Data ---
  const [featuredCollectibles, setFeaturedCollectibles] = useState<Collectible[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [collectionCollectibleIds, setCollectionCollectibleIds] = useState<number[]>([]);
  
  // --- Granular Loading States ---
  const [loadingStates, setLoadingStates] = useState({
    hero: true,
    projects: true,
    donators: true,
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      const collectionsRes = await fetch('/api/db/collection?limit=2');
      const collectionsData = await collectionsRes.json();
      
      const idsPromises = collectionsData.map(async (collection: Collection) => {
        const res = await fetch(`/api/db/collectible?collectionId=${collection.collectionId}`);
        const collectibles = await res.json();
        return collectibles.length > 0 ? collectibles[0].collectibleId : null;
      });
      const resolvedIds = (await Promise.all(idsPromises)).filter(id => id !== null);

      setFeaturedCollections(collectionsData);
      setCollectionCollectibleIds(resolvedIds as number[]);
      setLoadingStates(prev => ({...prev, hero: false}));
    };

    const fetchProjectsData = async () => {
      const res = await fetch('/api/db/collectible');
      const data = await res.json();
      setFeaturedCollectibles(data.slice(0, 3));
      setLoadingStates(prev => ({...prev, projects: false}));
    };

    const fetchDonatorsData = async () => {
      const recentPurchasesRes = await fetch('/api/db/userCollectible?getMostRecent=true');
      const recentPurchasesData = await recentPurchasesRes.json();

      const enrichedPurchases = await Promise.all(
        recentPurchasesData.map(async (purchase: RecentPurchase) => {
          try {
            const userRes = await fetch(`/api/db/public/user?userId=${purchase.ownerId}`);
            if (userRes.ok) {
              const userData = await userRes.json();
              return { ...purchase, username: userData.username };
            }
          } catch (error) {
            console.error(`Failed to fetch user for purchase ${purchase.userCollectibleId}`, error);
          }
          return purchase;
        })
      );
      
      setRecentPurchases(enrichedPurchases);
      setLoadingStates(prev => ({...prev, donators: false}));
    };

    fetchHeroData().catch(console.error);
    fetchProjectsData().catch(console.error);
    fetchDonatorsData().catch(console.error);

  }, []);
 
  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      console.log("Carousel slide changed to:", api.selectedScrollSnap() + 1)
    })
  }, [api])

  const getLocalizedString = (obj: { en: string; de: string; }, lang: 'en' | 'de') => {
    return obj[lang] || obj.en;
  };

  return (
    <div className="font-sans">
      <main>
        <section className="w-full">
              <div className="w-full h-60 relative">
                 <Image src="/images/cover.jpg" alt="coverImage" fill style={{objectFit:"cover"}}/>
              </div>
        </section>

        {/* --- Hero Section --- */}
        <section className="w-full py-12 md:py-20 bg-zinc-50 dark:bg-zinc-900">
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Featured Project
              </h2>
            </div>
            {loadingStates.hero ? <SectionSpinner /> : (
              <Carousel className="w-full" opts={{align: "start",loop: true,}} plugins={[Autoplay({delay: 12000,})]}>
                <CarouselContent>
                  {featuredCollections.map((collection, index) => (
                    <CarouselItem key={collection.collectionId}>
                      <div className="w-full flex flex-col md:flex-row justify-between gap-8 md:gap-12 lg:gap-6 p-1">
                        {collection.imageRef && (
                          <div className="md:w-1/2 flex justify-center items-center">
                            <Link href={`/campaign/${collectionCollectibleIds[index]}`} className="hover:underline">
                              <Image 
                                src={collection.imageRef.img} 
                                alt="hero collection"
                                className="rounded-lg shadow-2xl w-full max-w-md"
                                width={500}
                                height={500}
                              />
                            </Link>
                          </div>
                        )}
                        <div className="md:w-1/2">
                          <Card className="bg-card flex flex-col shadow-lg h-full">
                            <div className="py-5 pl-10 pr-10 text-left flex flex-col flex-grow justify-between min-h-0">
                               <div className="overflow-y-auto">
                                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                                  {collection ? getLocalizedString(collection.description, language).replace(/<[^>]*>?/gm, '').substring(0, 400) + '...' : "Default description..."}
                                </p>
                              </div>
                              <div className="mt-auto pt-4">
                                <NonUserButton label="Learn More" route={`/campaign/${collectionCollectibleIds[index]}`} />
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselDots />,
              </Carousel>
            )}
          </div>
        </section>

         {/* --- About Section (Static, no loading needed) --- */}
        <section className="w-full py-12 md:py-20 bg-zinc-50 dark:bg-zinc-900">
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                About UBUNɅTION
              </h2>
            </div>
            <div className="w-full flex flex-col md:flex-row justify-between gap-12 lg:gap-6 p-1">
              <div className="md:w-1/2">
                <Card className="bg-card flex flex-col shadow-lg h-full">
                  <div className="py-5 pl-10 pr-10 text-left flex flex-col flex-grow justify-between">
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                      Ubunation is dedicated to fostering a sense of community and enhancing social projects worldwide. Our mission is to connect people with the resources they need to make a positive impact in their communities.
                    </p>
                    <NonUserButton label="Learn More" route='https://www.ubunation.com/' isLink={true} />
                  </div>
                </Card>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <Link href='https://www.ubunation.com/' target='_blank' className="hover:underline">
                  <Image 
                    src='/images/ubuLion.jpg' 
                    alt="About Us"
                    className="rounded-lg shadow-2xl w-full max-w-md"
                    width={500}
                    height={500}
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- Charity Campaigns Section --- */}
        <section className="w-full py-12 md:py-20 bg-background">
          <div className="container flex-grow p-6 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Our Projects
              </h2>
            </div>
            {loadingStates.projects ? <SectionSpinner /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCollectibles.map(collectible => (
                    <Card key={collectible.collectibleId} className="bg-card w-full flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
                        {collectible.imageRef && (
                          <Link href={`/campaign/${collectible.collectibleId}`} className="hover:underline">
                              <Image 
                                  src={collectible.imageRef.img}
                                  alt={getLocalizedString(collectible.name, language)} 
                                  className="w-full h-56 object-cover"
                                  width={500}
                                  height={500}
                              />
                          </Link>
                        )}
                        <div className="bg-blue-600 text-white text-center py-2 font-semibold">
                            {getLocalizedString(collectible.name, language)}
                        </div>
                        <CardContent className="flex-grow text-center">
                            <p className="pt-6 text-muted-foreground">
                                {getLocalizedString(collectible.description, language).replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                            </p>
                        </CardContent>
                    </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* --- Last Donators Section --- */}
        <section className="w-full py-12 md:py-20 bg-zinc-50 dark:bg-zinc-900">
          <div className="container flex-grow p-6 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Last Donators
              </h2>
            </div>
            {loadingStates.donators ? <SectionSpinner /> : (
              recentPurchases && recentPurchases.length > 0 ? (
                isMobile ? (
                  <Carousel className="w-full max-w-xs mx-auto" opts={{align: "start",loop: true,}} plugins={[Autoplay({delay: 8000,})]}>
                    <CarouselContent>
                      {recentPurchases.map((item, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <Card className="overflow-hidden rounded-lg shadow-lg">
                              <div className="relative aspect-square w-full">
                                <CollectibleImage
                                  src={`${item.collectible.imageRef?.url}/${item.mint}.png`}
                                  fallbackSrc="/images/ubuLion.jpg"
                                  alt={getLocalizedString(item.collectible.name, language)}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  className="bg-muted"
                                />
                              </div>
                            </Card>
                            {item.username && (
                               <Link href={`/public/profile/${item.ownerId}`} className="hover:underline">
                                <p className="text-center text-sm font-semibold mt-2 truncate">{item.username}</p>
                               </Link>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10" />
                  </Carousel>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                    {recentPurchases.map(item => {
                      const imageUrl = `${item.collectible.imageRef?.url}/${item.mint}.png`;
                      const displayName = getLocalizedString(item.collectible.name, language);

                      return (
                        <div key={item.userCollectibleId} className="text-center">
                          <Card className="aspect-square w-full overflow-hidden rounded-full shadow-lg p-2">
                            <div className="relative w-full h-full">
                              <CollectibleImage
                                src={imageUrl}
                                fallbackSrc="/images/ubuLion.jpg"
                                alt={`${displayName} - Mint #${item.mint}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="bg-muted rounded-full"
                              />
                            </div>
                          </Card>
                          {item.username && (
                             <Link href={`/public/profile/${item.ownerId}`} className="hover:underline">
                              <p className="font-semibold mt-2 truncate">{item.username}</p>
                             </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <p className="text-center text-muted-foreground">No recent purchases to display right now.</p>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}