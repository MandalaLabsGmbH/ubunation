import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.accessToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const purchaseId = searchParams.get("purchaseId");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let purchaseItems: any[] = [];

        // Case 1: Fetch by a specific purchaseId (for the receipts modal)
        if (purchaseId) {
            const itemsResponse = await axios.get(`${API_BASE_URL}/PurchaseItem/getPurchaseItemsByPurchaseId`, {
                params: { purchaseId: parseInt(purchaseId) },
                headers: { 'Authorization': `Bearer ${token.accessToken}` }
            });
            purchaseItems = itemsResponse.data;
        } 
        // Case 2: Fetch all items for the logged-in user (for the profile page)
        else if (token.email) {
            // The Fix: Implement the multi-step fetch logic as you described.
            
            // Step A: Get the user's internal ID.
            const userResponse = await axios.get(`${API_BASE_URL}/User/getUserByEmail`, {
                params: { email: token.email },
                headers: { 'Authorization': `Bearer ${token.accessToken}` }
            });
            const userId = userResponse.data.userId;

            if (!userId) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            // Step B: Get all of the user's purchases.
            const purchasesResponse = await axios.get(`${API_BASE_URL}/Purchase/getPurchasesByUserId`, {
                params: { userId: userId },
                headers: { 'Authorization': `Bearer ${token.accessToken}` }
            });
            const userPurchases = purchasesResponse.data;

            // Step C: For each purchase, fetch its items and combine them.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const itemPromises = userPurchases.map((purchase: any) => 
                axios.get(`${API_BASE_URL}/PurchaseItem/getPurchaseItemsByPurchaseId`, {
                    params: { purchaseId: purchase.purchaseId },
                    headers: { 'Authorization': `Bearer ${token.accessToken}` }
                }).then(res => res.data)
            );
            
            const nestedItems = await Promise.all(itemPromises);
            purchaseItems = nestedItems.flat(); // Flatten the array of arrays into a single list

        } else {
            return NextResponse.json({ message: 'A purchaseId or user session is required' }, { status: 400 });
        }

        // Enrich the data by fetching full details for each item.
        const enrichedItems = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            purchaseItems.map(async (item: any) => {
                try {
                    const collectibleResponse = await axios.get(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                        params: { collectibleId: item.itemId },
                        headers: { 'Authorization': `Bearer ${token.accessToken}` }
                    });

                    let userCollectibleData = null;
                    if (item.purchasedUserItemId) {
                        const userCollectibleResponse = await axios.get(`${API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
                            params: { userCollectibleId: item.purchasedUserItemId },
                            headers: { 'Authorization': `Bearer ${token.accessToken}` }
                        });
                        userCollectibleData = Array.isArray(userCollectibleResponse.data) ? userCollectibleResponse.data[0] : userCollectibleResponse.data;
                    }

                    return {
                        ...item,
                        collectible: collectibleResponse.data,
                        userCollectible: userCollectibleData
                    };
                } catch (enrichError) {
                    console.error(`Failed to enrich item ${item.purchaseItemId}:`, enrichError);
                    return item;
                }
            })
        );

        return NextResponse.json(enrichedItems);

    } catch (e) {
        console.error("API route /api/db/purchaseItems error:", e);
        if (axios.isAxiosError(e)) {
            const err = e as AxiosError;
            return NextResponse.json(
                { message: err.message, details: err.response?.data },
                { status: err.response?.status || 500 }
            );
        }
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
