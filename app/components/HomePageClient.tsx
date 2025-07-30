'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import UserButton from "@/app/components/UserButton";
import { useTranslation } from '@/app/hooks/useTranslation';

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

interface HomePageClientProps {
  heroCollectible: Collectible | null;
  featuredCollectibles: Collectible[];
}

export default function HomePageClient({ heroCollectible, featuredCollectibles }: HomePageClientProps) {
  const { language, translate } = useTranslation();

  // Helper function to safely get the correct language string
  const getLocalizedString = (obj: { en: string; de: string; }, lang: 'en' | 'de') => {
    return obj[lang] || obj.en;
  };

  return (
    <div className="text-gray-800 font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* --- Hero Section --- */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 md:mb-32">
          {/* Text Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {heroCollectible ? getLocalizedString(heroCollectible.name, language) : "ULT Dream Careers Lion Collection by"} <span className="text-blue-600">UBUNɅTION</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {heroCollectible ? getLocalizedString(heroCollectible.description, language).replace(/<[^>]*>?/gm, '').substring(0, 400) + '...' : "Default description..."}
            </p>
             <UserButton label={translate('donateAndGetNft')} route='/purchase' />
          </div>
          
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
        </section>

        {/* --- Charity Campaigns Section --- */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {translate('discoverUbunation')}
            </h2>
            <p className="text-xl text-muted-foreground mt-2">
              {translate('exploreCampaigns')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {featuredCollectibles.map(collectible => (
                <Card key={collectible.collectibleId} className="bg-white w-full flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
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
                        <div className="mt-4">
                            <UserButton label={translate('buyNow')} route='/purchase' />
                        </div>
                        <p className="pt-6 text-gray-600">
                            {getLocalizedString(collectible.description, language).replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                        </p>
                    </CardContent>
                </Card>
            ))}

          </div>
        </section>
      </main>
    </div>
  );
}
