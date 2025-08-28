'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import UserButton from "@/app/components/UserButton";
import { useTranslation } from '@/app/hooks/useTranslation';
import CollectibleImage from './CollectibleImage';

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
  heroCollectible: Collectible | null;
  featuredCollectibles: Collectible[];
  recentPurchases: RecentPurchase[];
}

export default function HomePageClient({ heroCollectible, featuredCollectibles, recentPurchases }: HomePageClientProps) {
  const { language } = useTranslation();

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
          {/* className="flex-grow container mx-auto p-6" */}
          <div className="flex-grow p-6 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Image Content */}
            {heroCollectible && heroCollectible.imageRef && (
              <div className="md:w-1/2 flex justify-center">
              <Link href={`/campaign/${heroCollectible.collectibleId}`} className="hover:underline">
                <Image 
                  src={heroCollectible.imageRef.img} 
                  alt={getLocalizedString(heroCollectible.name, language)} 
                  className="rounded-lg shadow-2xl w-full max-w-md"
                  width={500}
                  height={500}
                />
              </Link>
              </div>
            )}
            {/* Text Content */}
            <Card key={'hero text'} className="bg-card w-full flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
            <div className="py-5 pl-10 pr-10 text-left">
              <p className="text-med text-muted-foreground mb-8 leading-relaxed">
                {heroCollectible ? getLocalizedString(heroCollectible.description, language).replace(/<[^>]*>?/gm, '').substring(0, 400) + '...' : "Default description..."}
              </p>
              <UserButton label="Learn More" route='/purchase' type='readMore' />
            </div>
            </Card>
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
            ) : (
              <p className="text-center text-muted-foreground">No recent purchases to display right now.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
