import { NextResponse, NextRequest } from "next/server";
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
    try {
       
        const { searchParams } = new URL(request.url);
        const collectionId = searchParams.get("collectionId");

        // Check if the projectId is provided in the request.
        if (!collectionId) {
            return NextResponse.json({ message: 'Bad Request: collectionId must be provided' }, { status: 400 });
        }

        // Make the API call to get the project data.
        const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Sponsor/getSponsorByOrganization`, {
            params: { 
                organization: collectionId 
            },
        });

        // Return the successful response data.
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
