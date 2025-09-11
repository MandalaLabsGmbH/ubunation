'use client'

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/app/hooks/useTranslation';
import CollectibleImage from '../../CollectibleImage';

// --- Type Definitions ---
interface PublicUser {
    userId: number;
    username: string;
    profilePictureUrl: string;
}

interface Collectible {
    collectibleId: number;
    name: { en: string; de: string; };
    imageRef: { url: string; };
}

interface UserCollectible {
    userCollectibleId: number;
    mint: number;
    createdDt: string;
}

interface EnrichedUserCollectible extends UserCollectible {
    collectible: Collectible;
}

interface PublicProfilePageClientProps {
    publicUser: PublicUser;
    totalCollectibles: number;
    mostRecentCollectible: EnrichedUserCollectible | null;
    recentCollectibles: EnrichedUserCollectible[];
    isCurrentUser: boolean;
}

// --- Main Component ---
export default function PublicProfilePageClient({
    publicUser,
    totalCollectibles,
    mostRecentCollectible,
    recentCollectibles,
    isCurrentUser
}: PublicProfilePageClientProps) {
    const { translate, language } = useTranslation();

    const displayName = publicUser.username;

    const getProfileImageUrl = () => {
        if (!mostRecentCollectible?.collectible?.imageRef?.url || !mostRecentCollectible?.mint) {
            return publicUser.profilePictureUrl || "/images/default-profile.png";
        }
        return `${mostRecentCollectible.collectible.imageRef.url}/${mostRecentCollectible.mint}.png`;
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
                        <p className="font-bold text-lg">{translate("publicProfilePageClient-ownedCollectiblesTitle-1")}</p>
                        <p className="text-3xl font-bold text-primary">{totalCollectibles}</p>
                    </div>
                    {isCurrentUser && (
                        <Link href="/profile" passHref>
                            <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 rounded-full">
                                {translate("publicProfilePageClient-viewProfileButton-1")}
                            </Button>
                        </Link>
                    )}
                </div>
            </section>

            {/* --- Owned Collectibles Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-foreground mb-8">{translate("publicProfilePageClient-ownedCollectiblesTitle-1")}</h2>
                {recentCollectibles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recentCollectibles.map((item) => {
                            const imageUrl = `${item.collectible.imageRef.url}/${item.mint}.png`;
                            const displayName = item.collectible.name[language as 'en' | 'de'] || item.collectible.name.en;
                            return (
                                <Link href={`/user_collectible/${item.userCollectibleId}`} key={item.userCollectibleId}>
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
                                                {translate("publicProfilePageClient-acquiredOnLabel-1")}: {formatDate(item.createdDt)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground">{translate("publicProfilePageClient-noCollectiblesMessage-1")}</p>
                )}
            </section>
        </main>
    );
}
