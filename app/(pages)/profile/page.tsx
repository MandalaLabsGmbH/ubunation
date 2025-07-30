import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import ProfilePageClient from "@/app/components/user/profile/ProfilePageClient";
import { redirect } from "next/navigation";

// --- Data Fetching Functions ---

// Fetches the full user object from your database
async function getUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/db/user?email=${session.user.email}`, {
            headers: new Headers(await headers()),
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
    }
}

// Fetches all of a user's purchase items (the most detailed data)
async function getPurchaseItems() {
     try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/db/purchaseItem`, {
            headers: new Headers(await headers()),
            cache: 'no-store',
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch purchase items:", error);
        return [];
    }
}

// --- Main Page Component ---

export default async function ProfilePage() {
    console.log("SERVER-SIDE ENV CHECK:", {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        AUTH_SECRET_IS_SET: !!process.env.AUTH_SECRET, // Check if the secret is set
    });
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/'); // Redirect to home if not logged in
    }

    // Fetch all necessary data in parallel
    const [user, allPurchaseItems] = await Promise.all([
        getUser(),
        getPurchaseItems()
    ]);

    if (!user) {
        // Handle case where user data couldn't be fetched
        return <div>Could not load user profile.</div>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedItems = allPurchaseItems.sort((a: any, b: any) => {
        const dateA = a.userCollectible ? new Date(a.userCollectible.createdDt).getTime() : 0;
        const dateB = b.userCollectible ? new Date(b.userCollectible.createdDt).getTime() : 0;
        return dateB - dateA;
    });

    const mostRecentPurchaseItem = sortedItems.length > 0 ? sortedItems[0] : null;
    const recentCollectibles = sortedItems.slice(0, 4);

    return (
        <ProfilePageClient
            user={user}
            totalCollectibles={allPurchaseItems.length}
            mostRecentPurchaseItem={mostRecentPurchaseItem}
            recentCollectibles={recentCollectibles}
        />
    );
}
