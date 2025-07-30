'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

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
    if (!collectibles || collectibles.length === 0) {
        return <p className="text-center text-muted-foreground">You don&apos;t own any collectibles yet.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {collectibles.map((item) => {
                const imageUrl = `${item.collectible.imageRef.url}/${item.mint}.png`;
                const displayName = item.collectible.name.en; // Defaulting to English for now

                return (
                    <Link href={`/campaign/${item.collectible.collectibleId}`} key={item.userCollectibleId}>
                        <Card className="aspect-square w-full overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-xl">
                            <div className="relative w-full h-full">
                                <Image
                                    src={imageUrl}
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
