'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/app/hooks/useTranslation';
import CollectibleImage from '../../CollectibleImage';
import SplitsView from '../../SplitsView';

// Define the type for the props this component receives
interface UserCollectibleDetails {
  userCollectible: {
    mint: number;
  };
  collectible: {
    collectibleId: number;
    name: { en: string; de: string; };
    description: { en: string; de: string; };
    imageRef?: { url: string; };
  };
  owner: {
    userId: number;
    username?: string;
  };
}

interface UserCollectibleTemplateProps {
  details: UserCollectibleDetails;
}

export default function UserCollectibleTemplate({ details }: UserCollectibleTemplateProps) {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'splits'>('overview');
  
  if (!details) {
    return <div>Loading...</div>;
  }

  const { userCollectible, collectible, owner } = details;

  // 1. Construct the dynamic image URL
  const imageUrl = `${collectible.imageRef?.url}/${userCollectible.mint}.png`;
  
  // 2. Construct the dynamic title with mint number
  const displayName = collectible.name[language] || collectible.name.en;
  const displayTitle = `${displayName} #${userCollectible.mint}`;

  // 3. Determine the owner's display name
  const ownerName = owner.username || `User ${owner.userId}`;

  const displayDescription = collectible.description[language] || collectible.description.en;

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      {/* Top Header Section - No purchase button */}
      <Card className="bg-card shadow-lg rounded-lg mb-8">
        <CardContent className="p-6">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{displayTitle}</h1>
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

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1">
              <Card className="bg-card shadow-lg rounded-lg overflow-hidden">
                <CollectibleImage
                  src={imageUrl}
                  fallbackSrc="/images/ubuLion.jpg"
                  alt={displayTitle}
                  width={800}
                  height={800}
                  className="w-full h-auto"
                />
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card className="bg-card shadow-lg rounded-lg w-full">
                <CardContent className="p-6 md:p-8">
                  <div className="pb-4 mb-4 border-b">
                    <p className="text-sm font-semibold text-muted-foreground">Owned By</p>
                    <p className="text-lg font-bold">{ownerName}</p>
                  </div>

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