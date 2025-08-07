'use client'

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/app/hooks/useTranslation';
import CollectibleImage from '../../CollectibleImage';
import SplitsView from '../../SplitsView';
import { Button } from '@/components/ui/button'; // Import Button
import { Download, Loader2 } from 'lucide-react'; // Import icons

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
  const [isDownloading, setIsDownloading] = useState(false);

  if (!details) {
    return <div>Loading...</div>;
  }

  const { userCollectible, collectible, owner } = details;
  const imageUrl = `${collectible.imageRef?.url}/${userCollectible.mint}.png`;
  const displayName = collectible.name[language] || collectible.name.en;
  const displayTitle = `${displayName} #${userCollectible.mint}`;
  const ownerName = owner.username || `User ${owner.userId}`;
  const displayDescription = collectible.description[language] || collectible.description.en;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // 1. Fetch the image data from the S3 URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Image could not be fetched.');
      }
      // 2. Convert the response to a blob
      const blob = await response.blob();
      // 3. Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 4. Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = `${displayName.replace(/\s+/g, '_')}_mint_${userCollectible.mint}.png`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      
      // 5. Programmatically click the link to start the download
      link.click();
      
      // 6. Clean up by removing the link and revoking the blob URL
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Could not download the image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

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
              <div className="pt-5">
                  <Button className= "w-full bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-transform transform hover:scale-105" onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Download .png
                  </Button>
              </div>
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