import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CollectiblesGrid from "@/app/components/user/collectibles/CollectiblesGrid";

// --- Data Fetching Function ---
async function getMyCollectibles() {
    try {
        // The Fix: Call the unified endpoint with the correct parameter
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/db/collectible?myCollectibles=true`, {
            headers: new Headers(await headers()),
            cache: 'no-store',
        });
        if (!res.ok) {
            console.error("Failed to fetch user collectibles:", await res.text());
            return [];
        }
        return res.json();
    } catch (error) {
        console.error("Error in getMyCollectibles:", error);
        return [];
    }
}

// --- Main Page Component ---
export default async function MyCollectiblesPage() {
    const session = await getServerSession(authOptions);
    // Protect the route by redirecting if the user is not logged in.
    if (!session) {
        redirect('/');
    }

    const myCollectibles = await getMyCollectibles();

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-center mb-12">My Collectibles</h1>
            <CollectiblesGrid collectibles={myCollectibles} />
        </main>
    );
}
