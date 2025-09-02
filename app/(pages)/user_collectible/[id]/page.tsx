import UserCollectibleTemplate from '@/app/components/user/userCollectible/UserCollectibleTemplate';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/app/contexts/UserContext';
import type { Metadata } from 'next';

// --- Type Definitions for API Data ---
interface UserCollectibleDetails {
  userCollectible: {
    mint: number;
    userCollectibleId: number;
    collectibleId: number;
    ownerId: number;
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

// --- Type Definition for Page Props ---
// FIX: The build error indicates that 'params' is a Promise for this page.
type PageProps = {
  params: Promise<{ id: string }>;
};

// --- Custom Session Type Definition ---
interface SessionWithToken extends Session {
  idToken?: string;
}

// --- Server-Side Data Fetching Function ---
async function getDetails(id: string, session: SessionWithToken | null): Promise<UserCollectibleDetails | null> {
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        const userCollectibleResponse = await axios.get<UserCollectibleDetails['userCollectible'][]>(`${API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
            params: { userCollectibleId: id }
        });

        const userCollectible = userCollectibleResponse.data[0];
        if (!userCollectible) {
            throw new Error('User collectible not found');
        }

        const collectibleResponse = await axios.get<UserCollectibleDetails['collectible']>(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
            params: { collectibleId: userCollectible.collectibleId }
        });

        let ownerResponse;
        if (session?.idToken) {
            ownerResponse = await axios.get<UserCollectibleDetails['owner']>(`${API_BASE_URL}/User/getUserByUserId`, {
                params: { userId: userCollectible.ownerId },
                headers: { 'Authorization': `Bearer ${session.idToken}` }
            });
        } else {
            ownerResponse = await axios.get<UserCollectibleDetails['owner']>(`${API_BASE_URL}/User/getPublicUserByUserId`, {
                params: { userId: userCollectible.ownerId },
            });
        }

        return {
            userCollectible: userCollectible,
            collectible: collectibleResponse.data,
            owner: ownerResponse.data
        };

    } catch (error) {
        console.error("Error fetching user collectible details:", error);
        return null;
    }
}

// --- Dynamic Metadata Generation ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await the params promise to get the id
  const { id } = await params;
  const details = await getDetails(id, null);

  if (!details) {
    return {
      title: 'Collectible Not Found'
    };
  }
  
  const { collectible, userCollectible } = details;
  const title = `${collectible.name.en} #${userCollectible.mint}`;
  const description = "I just donated to Ubunation and received this artwork. Come check it out!";
  const imageUrl = `${collectible.imageRef?.url}/${userCollectible.mint}.png`;
  const pageUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/user_collectible/${id}`
    : '';


  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: title,
        },
      ],
      type: 'website',
    },
     twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
    },
  };
}


// --- Main Page Component ---
export default async function UserCollectiblePage({ params }: PageProps) {
    const session = await getServerSession(authOptions) as SessionWithToken | null;
    // FIX: Await the params Promise to get the actual ID.
    const { id } = await params;
    const details = await getDetails(id, session);

    if (!details || !details.collectible || !details.userCollectible || !details.owner) {
        notFound();
    }

    let isOwner = false;
    if (session?.user?.email && session.idToken) {
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
            const userResponse = await axios.get<User>(`${API_BASE_URL}/User/getUserByEmail`, {
                params: { email: session.user.email },
                headers: { 'Authorization': `Bearer ${session.idToken}` }
            });
            const currentUserId = userResponse.data.userId;
            if (currentUserId && details.owner.userId === currentUserId) {
                isOwner = true;
            }
        } catch (error) {
            console.error("Could not determine ownership:", error);
        }
    }

    return (
        <UserCollectibleTemplate details={details} isOwner={isOwner} />
    );
}

