import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

// This function can now fetch a user by their email.
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.accessToken || !token.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        // We allow fetching by email, which is what we get from the session token.
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }
        
        const userResponse = await axios.get(`${API_BASE_URL}/User/getUserByEmail`, {
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
