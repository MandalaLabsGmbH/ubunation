import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

// This function fetches the detailed items for a single purchase and enriches them with full details.
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.accessToken) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const purchaseId = searchParams.get("purchaseId");

        if (!purchaseId) {
            return NextResponse.json({ message: 'purchaseId is required' }, { status: 400 });
        }

        // 1. Fetch the basic list of purchase items for the given purchaseId.
        const itemsResponse = await axios.get(`${API_BASE_URL}/PurchaseItem/getPurchaseItemsByPurchaseId`, {
            params: { purchaseId: parseInt(purchaseId) },
            headers: { 'Authorization': `Bearer ${token.accessToken}` }
        });

        const purchaseItems = itemsResponse.data;

        // 2. Enrich the data by fetching full details for each item.
        const enrichedItems = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            purchaseItems.map(async (item: any) => {
                try {
                    // Fetch the full Collectible object using the itemId
                    const collectibleResponse = await axios.get(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                        params: { collectibleId: item.itemId },
                        headers: { 'Authorization': `Bearer ${token.accessToken}` }
                    });

                    let userCollectibleData = null;
                    
                    // The Fix: Be more flexible with the type of purchasedUserItemId.
                    // This handles cases where the ID might be a string in the JSON response.
                    if (item.purchasedUserItemId) {
                        const id = parseInt(item.purchasedUserItemId, 10);
                        if (!isNaN(id)) { // Ensure the ID is a valid number
                            const userCollectibleResponse = await axios.get(`${API_BASE_URL}/UserCollectible/getUserCollectibleByUserCollectibleId`, {
                                params: { userCollectibleId: id },
                                headers: { 'Authorization': `Bearer ${token.accessToken}` }
                            });
                            userCollectibleData = userCollectibleResponse.data;
                        }
                    }

                    // Combine the original item with the detailed data
                    return {
                        ...item,
                        collectible: collectibleResponse.data,
                        userCollectible: userCollectibleData[0] // This will be null if not found, preventing errors
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
