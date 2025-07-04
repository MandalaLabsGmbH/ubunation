import { NextResponse, NextRequest } from "next/server";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const collectibleId = searchParams.get("collectibleId");
        const collectionId = searchParams.get("collectionId");

        // Case 1: Fetch a single collectible by its ID.
        if (collectibleId) {
            const response = await axios.get(`${API_BASE_URL}/Collectible/getCollectibleByCollectibleId`, {
                params: { collectibleId }
            });
            return NextResponse.json(response.data);
        }
        
        // Case 2: Fetch all collectibles in a collection.
        if (collectionId) {
            const response = await axios.get(`${API_BASE_URL}/Collectible/getCollectiblesByCollection`, {
                params: { collectionId }
            });
            return NextResponse.json(response.data);
        }
        
        // Case 3: Fetch ALL collectibles if no specific ID is provided.
        // This is the default behavior.
        const response = await axios.get(`${API_BASE_URL}/Collectible/getAllCollectibles`);
        return NextResponse.json(response.data);

    } catch (e) {
        // Log the error for debugging purposes.
        console.error({ e });

        // Handle Axios-specific errors to return a more informative response.
        if (axios.isAxiosError(e)) {
            const err = e as AxiosError;
            return NextResponse.json(
                { message: err.message, details: err.response?.data },
                { status: err.response?.status || 500, statusText: "API call failed" }
            );
        }

        // Handle generic errors.
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
