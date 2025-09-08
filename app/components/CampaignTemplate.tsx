'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/app/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/app/hooks/useTranslation';
import SplitsView from './SplitsView';

// Update the props to accept a single 'collectible' object
interface Sponsor {
    sponsorId: number;
    name: { en: string; de: string; };
    description: { en: string; de: string; };
    organization: { en: string; de: string; };
    urls: { website: string; };
    imageRef?: { profile: string; };
  };

interface CampaignTemplateProps {
  collectible: {
    collectibleId: number;
    name: { en: string; de: string; };
    description: { en: string; de: string; };
    imageRef?: { url: string; img: string };
    price?: { base: string };
  },
  sponsors: Sponsor[];
}

export default function CampaignTemplate({ collectible, sponsors }: CampaignTemplateProps) {
  // All hooks must be called at the top level of the component, before any returns.
  const { language } = useTranslation();
  const { addToCart } = useCart();
  
  if (!collectible) {
    return <div>Loading...</div>;
  }

  const displayName = collectible.name[language] || collectible.name.en;
  const displayDescription = collectible.description[language] || collectible.description.en;
  // The Fix: Get the price from the collectible data, default to 0 if not present.
  const itemPrice = parseFloat(collectible.price?.base || '0');

  const handleAddToCart = () => {
    addToCart({
      collectibleId: collectible.collectibleId,
      name: displayName,
      imageUrl: collectible.imageRef?.img || '',
      price: itemPrice, // Use the dynamic price
    });
    alert(`${displayName} has been added to your cart!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
          <section className="w-full py-12 md:py-20 bg-white dark:bg-zinc-900">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {displayName}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <Card className="bg-card shadow-lg rounded-lg overflow-hidden">
                  <Image
                    src={collectible.imageRef?.img || ''}
                    alt={displayName}
                    width={800}
                    height={800}
                    className="w-full h-auto"
                  />
                </Card>
                <div className="pt-10 flex gap-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-transform transform hover:scale-105" onClick={handleAddToCart}>
                    {'buyNow'}
                  </Button>
              </div>
              </div>
              <div className="md:col-span-2">
                <Card className="bg-card shadow-lg rounded-lg w-full">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: displayDescription }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          {/* NEW: Sponsors Section */}
              {sponsors && sponsors.length > 0 && (
                  <section className="w-full py-12 md:py-20 bg-zinc-50 dark:bg-zinc-900">
                          <h2 className="text-xl font-semibold text-foreground mb-6">Meet Our Voices</h2>
                          <div className="flex flex-wrap items-center gap-x-12 gap-y-6 mb-6">
                            <p className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                              That should be a carousel for the voices, click on the image links to social profile (images are only examples background should be white like the other boxes.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                              {sponsors.map((sponsor) => (
                                  <Card key={sponsor.sponsorId} className="bg-card pt-5 pl-5 pr-5 flex flex-col items-center shadow-lg h-80 transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
                                                              <Card className="aspect-square w-30 justify-center items-center overflow-hidden rounded-full shadow-lg p-2">
                                                                <div className="relative w-full">
                                                                  <Link href={`${sponsor.urls.website}`} target="_blank" className="hover:underline">
                                                                   <Image
                                                                      src={sponsor.imageRef?.profile || ''  }
                                                                      alt={`${sponsor.name} logo`}
                                                                      width={200}
                                                                      height={300}
                                                                      className="object-cover scale-120"
                                                                  />
                                                                  </Link>
                                                                </div>
                                                              </Card>
                                                              <div className="flex flex-col items-center text-center mt-2">
                                                                  <p className="text-med font-medium text-muted-foreground">{sponsor.name.en}</p>
                                                              </div>
                                                               <div className="flex flex-col w-30 items-center text-center">
                                                                  <p className="text-sm text-muted-foreground">{sponsor.description.en}</p>
                                                              </div>
                                </Card>
                              ))}
                          </div>
                  </section>
              )}
        <SplitsView />
      </div>
)
}