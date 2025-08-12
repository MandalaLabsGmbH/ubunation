import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET function remains the same
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.idToken || !token.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }
        
        const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail`, {
            params: { email },
            headers: { 'Authorization': `Bearer ${token.idToken}` }
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

export async function PATCH(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.idToken || !token.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail`, {
            params: { email: token.email },
            headers: { 'Authorization': `Bearer ${token.idToken}` }
        });
        const userId = userResponse.data.userId;

        if (!userId) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Get the entire body from the incoming request.
        const body = await request.json();
        
        // Construct the payload by spreading the entire body.
        // This ensures 'userType', 'username', and 'authData' are all included.
        const payload = { 
            userId: userId, 
            ...body 
        };

        const response = await axios.patch(`${NEXT_PUBLIC_API_BASE_URL}/User/updateUserByUserId`, 
            payload, 
            {
                headers: { 'Authorization': `Bearer ${token.idToken}` }
            }
        );

        return NextResponse.json(response.data);

    } catch (e) {
        console.error("API route PATCH /api/db/user error:", e);
        if (axios.isAxiosError(e)) {
            console.error("Backend Error Details:", e.response?.data);
            return NextResponse.json(
                { message: e.message, details: e.response?.data },
                { status: e.response?.status || 500 }
            );
        }
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
