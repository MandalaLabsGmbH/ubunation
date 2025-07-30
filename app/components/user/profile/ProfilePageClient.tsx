'use client'

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useUser, User } from '@/app/contexts/UserContext';
import { useEditProfileModal } from '@/app/contexts/EditProfileModalContext';
import CollectibleImage from '../../CollectibleImage';

// --- Type Definitions ---
interface PurchaseItem {
    purchaseItemId: number;
    purchaseId: number;
    createdDt: string;
    collectible: {
        collectibleId: number;
        name: { en: string; de: string };
        imageRef: { url: string };
    };
    userCollectible: {
        userCollectibleId: number; // Add this ID for linking
        mint: number;
        createdDt: string;
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
    const { setUser } = useUser();
    const { openModal: openEditProfileModal } = useEditProfileModal();
    
    useEffect(() => {
        if (user) {
            setUser(user);
        }
    }, [user, setUser]);

    const displayName = user.username || user.email;
    const displayCountry = user.authData?.country;

    const getProfileImageUrl = () => {
        if (!mostRecentPurchaseItem?.collectible?.imageRef?.url || !mostRecentPurchaseItem?.userCollectible?.mint) {
            return "/images/default-profile.png";
        }
        return `${mostRecentPurchaseItem.collectible.imageRef.url}/${mostRecentPurchaseItem.userCollectible.mint}.png`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}.${date.getFullYear()}`;
    };

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* --- Profile Header Section --- */}
            <section className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
                <div className="text-left">
                    <h1 className="text-5xl font-bold text-foreground">{displayName}</h1>
                    {displayCountry && (
                        <p className="text-lg text-muted-foreground mt-2">{displayCountry}</p>
                    )}
                </div>

                <div className="flex-shrink-0 flex flex-col items-center">
                    <Card className="rounded-full w-48 h-48 p-4 shadow-lg relative overflow-hidden">
                        <CollectibleImage
                            src={getProfileImageUrl()}
                            fallbackSrc="/images/ubuLion.jpg"
                            alt="Profile Collectible"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-full"
                        />
                    </Card>
                    <div className="mt-4 text-center p-4 bg-card rounded-lg shadow-md w-full">
                        <p className="font-bold text-lg">Owned Collectibles</p>
                        <p className="text-3xl font-bold text-primary">{totalCollectibles}</p>
                        <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                            {user.email}
                        </div>
                    </div>
                    <Button onClick={openEditProfileModal} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 rounded-full">
                        Edit Profile
                    </Button>
                </div>
            </section>

            {/* --- Owned Collectibles Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-foreground mb-8">Owned Collectibles</h2>
                {recentCollectibles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recentCollectibles.map((item) => {
                            if (!item.userCollectible) return null; 
                            const imageUrl = `${item.collectible.imageRef.url}/${item.userCollectible.mint}.png`;
                            const displayName = item.collectible.name[language as 'en' | 'de'] || item.collectible.name.en;
                            return (
                                // The Fix: Wrap the Card in a Link to the specific user collectible detail page
                                <Link href={`/user_collectible/${item.userCollectible.userCollectibleId}`} key={item.purchaseItemId}>
                                    <Card className="w-full flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
                                        <CollectibleImage
                                            src={imageUrl}
                                            fallbackSrc="/images/ubuLion.jpg"
                                            alt={displayName}
                                            width={500}
                                            height={500}
                                            className="w-full h-56 object-cover"
                                        />
                                        <div className="bg-primary text-primary-foreground text-center py-2 font-semibold">
                                            {displayName}
                                        </div>
                                        <CardContent className="flex-grow text-center p-4">
                                            <p className="text-sm text-muted-foreground">
                                                Purchased On: {formatDate(item.userCollectible.createdDt)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No collectibles purchased yet.</p>
                )}
                {totalCollectibles > 4 && (
                    <div className="text-center mt-12">
                        <Link href="/collectibles" passHref>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-full px-10 py-6 text-lg">
                                View All Collectibles
                            </Button>
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
