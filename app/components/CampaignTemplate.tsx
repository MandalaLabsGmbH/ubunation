'use client'

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/app/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/app/hooks/useTranslation';
import SplitsView from './SplitsView';

// Update the props to accept a single 'collectible' object
interface CampaignTemplateProps {
  collectible: {
    collectibleId: number;
    name: { en: string; de: string; };
    description: { en: string; de: string; };
    imageRef?: { url: string; img: string };
    price?: { base: string };
  };
}

export default function CampaignTemplate({ collectible }: CampaignTemplateProps) {
  // All hooks must be called at the top level of the component, before any returns.
  const { language, translate } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'splits'>('overview');
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
      imageUrl: collectible.imageRef?.url || '',
      price: itemPrice, // Use the dynamic price
    });
    alert(`${displayName} has been added to your cart!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      {/* Top Header Section */}
      <Card className="bg-card shadow-lg rounded-lg mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{displayName}</h1>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="border-b border-border mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('splits')}
            className={`py-4 px-1 text-sm font-medium transition-colors ${activeTab === 'splits' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Splits
          </button>
        </nav>
      </div>

      {/* Tab Content */}<div>
        {activeTab === 'overview' && (
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
                  {translate('buyNow')}
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
        )}

        {/* The Fix: Render the SplitsView component */}
        {activeTab === 'splits' && <SplitsView />}
      </div>
    </div>
  );
}