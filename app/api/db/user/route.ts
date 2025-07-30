import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET function remains the same
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.accessToken || !token.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }
        
        const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail`, {
            params: { email },
            headers: { 'Authorization': `Bearer ${token.accessToken}` }
        });

        return NextResponse.json(userResponse.data);
    } catch (e) {
        console.error("API route /api/db/user error:", e);
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

// The Fix: Update the PATCH method to use the correct updateUserByUserId endpoint.
export async function PATCH(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.accessToken || !token.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Step 1: Get the user's internal database ID.
        const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail`, {
            params: { email: token.email },
            headers: { 'Authorization': `Bearer ${token.accessToken}` }
        });
        const userId = userResponse.data.userId;

        if (!userId) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Step 2: Get the update data from the request body.
        const body = await request.json();
        const { username, authData } = body;

        // Step 3: Call the correct backend endpoint with the userId.
        const response = await axios.patch(`${NEXT_PUBLIC_API_BASE_URL}/User/updateUserByUserId`, 
            { 
                userId: userId, 
                username, 
                authData 
            }, 
            {
                headers: { 'Authorization': `Bearer ${token.accessToken}` }
            }
        );

        return NextResponse.json(response.data);

    } catch (e) {
        console.error("API route PATCH /api/db/user error:", e);
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
