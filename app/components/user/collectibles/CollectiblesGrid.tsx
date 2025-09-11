'use client'

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/app/hooks/useTranslation';
import CollectibleImage from '../../CollectibleImage'; // Import the new component

// --- Type Definition ---
interface EnrichedUserCollectible {
    userCollectibleId: number;
    mint: number;
    collectible: {
        collectibleId: number;
        name: { en: string; de: string };
        imageRef: { url: string };
    };
}

interface CollectiblesGridProps {
    collectibles: EnrichedUserCollectible[];
}

// --- Main Component ---
export default function CollectiblesGrid({ collectibles }: CollectiblesGridProps) {
    const { translate } = useTranslation();
    if (!collectibles || collectibles.length === 0) {
        return <p className="text-center text-muted-foreground">{translate("collectiblesGrid-noCollectiblesMessage-1")}</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {collectibles.map((item) => {
                const imageUrl = `${item.collectible.imageRef.url}/${item.mint}.png`;
                const displayName = item.collectible.name.en; // Defaulting to English for now

                return (
                    // The Fix: Link to the specific user collectible detail page
                    <Link href={`/user_collectible/${item.userCollectibleId}`} key={item.userCollectibleId}>
                        <Card className="aspect-square w-full overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-xl">
                            <div className="relative w-full h-full">
                                {/* The Fix: Use the CollectibleImage component for robust loading */}
                                <CollectibleImage
                                    src={imageUrl}
                                    fallbackSrc="/images/ubuLion.jpg"
                                    alt={displayName}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="bg-muted"
                                />
                            </div>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
