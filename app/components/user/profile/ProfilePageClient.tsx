'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from '@/app/hooks/useTranslation';

// --- Type Definitions ---
interface User {
    username?: string;
    email: string;
    authData?: { country?: string };
}

interface PurchaseItem {
    purchaseId: number;
    createdDt: string;
    collectible: {
        collectibleId: number;
        name: { en: string; de: string };
        imageRef: { url: string };
    };
    userCollectible: {
        mint: number;
    };
}

interface ProfilePageClientProps {
    user: User;
    totalCollectibles: number;
    mostRecentPurchaseItem: PurchaseItem | null;
    recentCollectibles: PurchaseItem[];
}

// --- Main Component ---
export default function ProfilePageClient({
    user,
    totalCollectibles,
    mostRecentPurchaseItem,
    recentCollectibles
}: ProfilePageClientProps) {
    const { language } = useTranslation();

    const displayName = user.username || user.email;
    const displayCountry = user.authData?.country;

    const getProfileImageUrl = () => {
        if (!mostRecentPurchaseItem) {
            return "/images/ubulion.jpg"; // A fallback image
        }
        const { collectible, userCollectible } = mostRecentPurchaseItem;
        return `${collectible.imageRef.url}/${userCollectible.mint}.png`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}.${date.getFullYear()}`;
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* --- Profile Header Section --- */}
            <section className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
                <div className="text-left">
                    <h1 className="text-5xl font-bold text-foreground">{displayName}</h1>
                    {displayCountry && (
                        <p className="text-lg text-muted-foreground mt-2">{displayCountry}</p>
                    )}
                </div>

                <div className="flex-shrink-0 justify-items-center">
                    <Card className="rounded-full w-48 h-48 p-4 shadow-lg relative overflow-hidden">
                        <Image
                            src={getProfileImageUrl()}
                            alt="Profile Collectible"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-full"
                        />
                    </Card>
                    <div className="mt-4 text-center p-4 bg-card rounded-lg shadow-md md:justify-items-center">
                        <p className="font-bold text-lg">Owned Collectibles</p>
                        <p className="text-3xl font-bold text-primary">{totalCollectibles}</p>
                        <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                            {user.email}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Owned Collectibles Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-foreground mb-8">Owned Collectibles</h2>
                {recentCollectibles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recentCollectibles.map((item) => {
                            const imageUrl = `${item.collectible.imageRef.url}/${item.userCollectible.mint}.png`;
                            const displayName = item.collectible.name[language as 'en' | 'de'] || item.collectible.name.en;
                            return (
                                <Card key={item.purchaseId} className="w-full flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
                                    <Link href={`/campaign/${item.collectible.collectibleId}`} className="hover:underline">
                                        <Image
                                            src={imageUrl}
                                            alt={displayName}
                                            width={500}
                                            height={500}
                                            className="w-full h-56 object-cover"
                                        />
                                    </Link>
                                    <div className="bg-primary text-primary-foreground text-center py-2 font-semibold">
                                        {displayName}
                                    </div>
                                    <CardContent className="flex-grow text-center p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Purchased On: {formatDate(item.createdDt)}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No collectibles purchased yet.</p>
                )}
            </section>
        </main>
    );
}
