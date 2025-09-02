'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/app/hooks/useTranslation';
import CollectibleImage from '../../CollectibleImage';
import SplitsView from '../../SplitsView';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

// --- SVG Icon Component ---
const FacebookIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

// --- Type Definitions ---
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
  isOwner: boolean;
}

export default function UserCollectibleTemplate({ details, isOwner }: UserCollectibleTemplateProps) {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'splits'>('overview');
  const [isDownloading, setIsDownloading] = useState(false);

  if (!details) {
    return <div>Loading...</div>;
  }

  const { userCollectible, collectible, owner } = details;
  const imageUrl = `${collectible.imageRef?.url}/${userCollectible.mint}.png`;
  const displayName = collectible.name[language as 'en' | 'de'] || collectible.name.en;
  const displayTitle = `${displayName} #${userCollectible.mint}`;
  const ownerName = owner.username || `User ${owner.userId}`;
  const displayDescription = collectible.description[language as 'en' | 'de'] || collectible.description.en;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Image could not be fetched.');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = `${displayName.replace(/\s+/g, '_')}_mint_${userCollectible.mint}.png`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Could not download the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareToFacebook = () => {
    const shareUrl = window.location.href;
    const quoteText = "I just donated to Ubunation and received this artwork. Come check it out!";
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quoteText)}`;

    // Open a popup window for sharing
    window.open(facebookShareUrl, 'facebook-share-dialog', 'width=600,height=400');
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <Card className="bg-card shadow-lg rounded-lg mb-8">
        <CardContent className="p-6">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{displayTitle}</h1>
        </CardContent>
      </Card>

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
              {isOwner && (
                <div className="pt-5 space-y-3">
                    <Button className= "w-full bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-transform transform hover:scale-105" onClick={handleDownload} disabled={isDownloading}>
                      {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download .png
                    </Button>
                    <Button className= "w-full bg-sky-600 hover:bg-sky-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-transform transform hover:scale-105" onClick={handleShareToFacebook}>
                      <FacebookIcon />
                      Share to Facebook
                    </Button>
                </div>
              )}
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

        {activeTab === 'splits' && <SplitsView />}
      </div>
    </div>
  );
}

