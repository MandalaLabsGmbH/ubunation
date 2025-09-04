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


// Define the types for the props, matching the multilingual structure
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
  userCollectibleId: number;
  collectible: {
    name: { en: string; de: string; };
    imageRef?: {
      url: string;
      img: string;
    };
  };
}

interface HomePageClientProps {
  featuredCollectibles: Collectible[];
  featuredCollections: Collection[];
  recentPurchases: RecentPurchase[];
  collectionCollectibleIds: number[];
}

export default function HomePageClient({ featuredCollectibles, featuredCollections, recentPurchases, collectionCollectibleIds }: HomePageClientProps) {
  const { language } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [api, setApi] = useState<CarouselApi>()

  const isMobile = useMediaQuery('md');
 
  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      console.log("Carousel slide changed to:", api.selectedScrollSnap() + 1)
    })
  }, [api])

  // Helper function to safely get the correct language string
  const getLocalizedString = (obj: { en: string; de: string; }, lang: 'en' | 'de') => {
    return obj[lang] || obj.en;
  };

  return (
    <div className="font-sans">
      <main>
        {/* ---  Site Header Image --- */}
        <section className="w-full">
              <div className="w-full h-60 relative">
                 <Image src="/images/cover.jpg" alt="coverImage" fill style={{objectFit:"cover"}}/>
              </div>
        </section>

        {/* --- Hero Section --- */}
        <section className="w-full py-12 md:py-20 bg-zinc-50 dark:bg-zinc-900">
          {/* FIX: Added 'relative' to this container to position the buttons correctly */}
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Featured Project
              </h2>
            </div>
            <Carousel className="w-full" opts={{align: "start",loop: true,}} plugins={[Autoplay({delay: 12000,})]}>
              <CarouselContent>
                {featuredCollections.map((collection, index) => (
                  <CarouselItem key={collection.collectionId}>
                    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 p-1">
                      {/* Image Content */}
                      {collection.imageRef && (
                        <div className="shrink md:w-1/2 flex justify-center">
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
                      {/* Text Content */}
                      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 p-1">
                        <Card key={'hero text'} className="bg-card flex flex-col overflow-hidden shadow-lg">
                          <div className="py-5 pl-10 pr-10 text-left">
                            <p className="text-md text-muted-foreground mb-8 leading-relaxed md:text-sm">
                              {collection ? getLocalizedString(collection.description, language).replace(/<[^>]*>?/gm, '').substring(0, 400) + '...' : "Default description..."}
                            </p>
                            <NonUserButton label="Learn More" route={`/campaign/${collectionCollectibleIds[index]}`} />
                          </div>
                        </Card>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselDots />,
            </Carousel>
          </div>
        </section>

         {/* --- About Section --- */}
        <section className="w-full py-12 md:py-20 bg-zinc-50 dark:bg-zinc-900">
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                About UBUNɅTION
              </h2>
            </div>
                    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 p-1">
                      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 p-1">
                        <Card key={'hero text'} className="bg-card flex flex-col overflow-hidden shadow-lg">
                          <div className="py-5 pl-10 pr-10 text-left">
                            <p className="text-md text-muted-foreground mb-8 leading-relaxed md:text-sm">
                              Ubunation is dedicated to fostering a sense of community and enhancing social projects worldwide. Our mission is to connect people with the resources they need to make a positive impact in their communities.
                            </p>
                            <NonUserButton label="Learn More" route='https://www.ubunation.com/' isLink={true} />
                          </div>
                        </Card>
                      </div>
                      {/* Image Content */}
                        <div className="shrink md:w-1/2 flex justify-center">
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
                      {/* Text Content */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCollectibles.map(collectible => (
                  <Card key={collectible.collectibleId} className="bg-card w-full flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl">
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
            {recentPurchases && recentPurchases.length > 0 ? (
              // Conditionally render based on the isMobile boolean
              isMobile ? (
                // --- MOBILE VIEW: CAROUSEL ---
                <Carousel className="w-full max-w-xs mx-auto" opts={{align: "start",loop: true,}} plugins={[Autoplay({delay: 8000,})]}>
                  <CarouselContent>
                    {/* Group purchases into pairs for the carousel */}
                    {recentPurchases.map((item, index) => (
                      <CarouselItem key={index}>
                        <div className="flex justify-center items-center gap-4">
                            <div key={item.userCollectibleId} className="aspect-square w-1/2">
                               <Card className="w-full h-full overflow-hidden rounded-full shadow-lg p-2">
                                  <div className="relative w-full h-full">
                                    <CollectibleImage
                                      src={`${item.collectible.imageRef?.url}/${item.mint}.png`}
                                      fallbackSrc="/images/ubuLion.jpg"
                                      alt={getLocalizedString(item.collectible.name, language)}
                                      fill
                                      style={{ objectFit: 'cover' }}
                                      className="bg-muted rounded-full"
                                    />
                                  </div>
                                </Card>
                            </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10" />
                  <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10" />
                </Carousel>
              ) : (
                // --- DESKTOP VIEW: GRID ---
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                  {recentPurchases.map(item => {
                    const imageUrl = `${item.collectible.imageRef?.url}/${item.mint}.png`;
                    const displayName = getLocalizedString(item.collectible.name, language);

                    return (
                      <div key={item.userCollectibleId} className="aspect-square w-full">
                        <Card className="w-full h-full overflow-hidden rounded-full shadow-lg p-2">
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
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <p className="text-center text-muted-foreground">No recent purchases to display right now.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}