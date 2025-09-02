import { NextResponse, NextRequest } from "next/server";
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ message: 'A userId is required' }, { status: 400 });
        }

        // This assumes you have a backend endpoint that can get user data by ID.
        // You would create a new endpoint on your backend that only returns public data.
        const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getPublicUserByUserId`, {
            params: { userId },
        });

        const userData = userResponse.data;

        // We will only return a subset of the user's data to the client.
        const publicProfile = {
            userId: userData.userId || 0,
            username: userData.username || 'Unknown',
            profilePictureUrl: userData.profileImg || '/images/ubuLion.png' // Assuming a profile picture URL
        };

        return NextResponse.json(publicProfile);

    } catch (e) {
        console.error("API route /api/db/user/public error:", e);
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