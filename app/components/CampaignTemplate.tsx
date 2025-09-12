'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/app/contexts/CartContext';
import { Button } from '@/components/ui/button';
import NonUserButton from "@/app/components/NonUserButton";
import { useTranslation } from '@/app/hooks/useTranslation';
import SplitsView from './SplitsView';
import ImageCarouselGallery from './ImageCarouselGallery'; // Import the new component

// --- Type Definitions ---
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
  const { translate, language } = useTranslation();
  const { addToCart } = useCart();

  // Add a few more images to the array to ensure smooth looping
  const galleryImages = [
    "https://ubunation.s3.eu-central-1.amazonaws.com/assets/samplePerson1.jpg",
    "https://ubunation.s3.eu-central-1.amazonaws.com/assets/samplePerson2.jpg",
    "https://ubunation.s3.eu-central-1.amazonaws.com/assets/samplePerson3.jpg",
    "https://ubunation.s3.eu-central-1.amazonaws.com/assets/samplePerson4.jpg",
    "https://ubunation.s3.eu-central-1.amazonaws.com/assets/samplePerson1.jpg",
    "https://ubunation.s3.eu-central-1.amazonaws.com/assets/samplePerson2.jpg",
  ];
  
  if (!collectible) {
    return <div>Loading...</div>;
  }

  const displayName = collectible.name[language as 'en'|'de'] || collectible.name.en;
  const displayDescription = collectible.description[language as 'en'|'de'] || collectible.description.en;
  const itemPrice = parseFloat(collectible.price?.base || '0');

  const handleAddToCart = () => {
    addToCart({
      collectibleId: collectible.collectibleId,
      name: displayName,
      imageUrl: collectible.imageRef?.img || '',
      price: itemPrice,
    });
    alert(`${displayName} has been added to your cart!`);
  };

  return (
    <div className="w-full">
          <section className="w-full py-12 md:py-20 bg-white">
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  {displayName}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:flex gap-8">
                <div className="md:col-span-1 lg:w-1/3">
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
                      {translate("campaignTemplate-buyNowButton-1")}
                    </Button>
                </div>
                </div>
                <div className="md:col-span-2 lg:w-2/3 flex">
                  <Card className="bg-card shadow-lg rounded-lg w-full flex flex-col">
                    <CardContent className="p-6 md:p-8 flex-grow">
                      <h2 className="text-xl font-semibold text-foreground mb-4">{translate("campaignTemplate-descriptionTitle-1")}</h2>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: displayDescription }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* --- Image Carousel Gallery Section --- */}
          <section className="w-full py-12 md:py-20 bg-zinc-50 dark:bg-zinc-900">
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
              <ImageCarouselGallery images={galleryImages} />
            </div>
          </section>

          {/* --- Sponsors Section --- */}
          {sponsors && sponsors.length > 0 && (
              <section className="w-full py-12 md:py-20 bg-white">
                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                      <h2 className="text-xl font-semibold text-foreground mb-6">{translate("campaignTemplate-sponsorsTitle-1")}</h2>
                      <div className="flex flex-wrap items-center gap-x-12 gap-y-6 mb-6">
                        <p className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                          {translate("campaignTemplate-sponsorsDescription-1")}
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
                                          alt={`${sponsor.name.en} logo`}
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
                      </div>
              </section>
          )}

        {/* --- Raffle and Rewards Section --- */}
        <section className="w-full py-12 md:py-20 bg-zinc-50 dark:bg-zinc-900">
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {translate("campaignTemplate-raffle-title-1")}
              </h2>
            </div>
            <div className="w-full flex flex-col-reverse md:flex-row justify-between gap-12 lg:gap-6 p-1">
              <div className="w-full">
                <Card className="bg-card flex flex-col shadow-lg h-full">
                  <div className="py-5 pl-10 pr-10 text-left flex flex-col flex-grow justify-between">
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                      {translate("campaignTemplate-raffle-description-1")}
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

        {/* --- Splits Section --- */}
        <section className="w-full py-12 md:py-20 bg-white">
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
              <SplitsView />
          </div>
        </section>
        
      </div>
  )
}