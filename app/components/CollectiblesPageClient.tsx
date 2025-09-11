'use client'

import { useTranslation } from '@/app/hooks/useTranslation';
import CollectiblesGrid from '@/app/components/user/collectibles/CollectiblesGrid';

// --- Type Definitions ---
// It's good practice to redefine or import types needed for props
interface Collectible {
    collectibleId: number;
    name: { en: string; de: string; };
    imageRef: { url: string; };
}

interface EnrichedUserCollectible {
    userCollectibleId: number;
    mint: number;
    collectible: Collectible;
}

// --- Client Component for Rendering ---
export default function CollectiblesPageClient({ collectibles }: { collectibles: EnrichedUserCollectible[] }) {
    const { translate } = useTranslation();

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-center mb-12">{translate("collectiblesPage-title-1")}</h1>
            <CollectiblesGrid collectibles={collectibles} />
        </main>
    );
}