import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import axios, { AxiosError } from 'axios';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CartItem = {
    price: number;
    quantity: number;
    // ... other properties can exist
};

// This function fetches all purchases for the logged-in user.
export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        if (!token?.idToken || !token.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // First, get the internal userId from your database using the email.
        const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail`, {
            params: { email: token.email },
            headers: {
                'Authorization': `Bearer ${token.idToken}`
            }
        });

        const userId = userResponse.data.userId;
        if (!userId) {
            return NextResponse.json({ message: 'User not found in database.' }, { status: 404 });
        }

        // Now, use the correct internal userId to fetch the purchases.
        const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/Purchase/getPurchasesByUserId`, {
            params: { 
                userId: userId,
            },
            headers: {
                'Authorization': `Bearer ${token.idToken}`
            }
        });

        // The Fix: Calculate both totalPrice and itemCount on the fly if they are missing.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const purchasesWithEnhancements = response.data.map((purchase: any) => {
            const enhancedPurchase = { ...purchase };

            // Check if a cart exists to perform calculations.
            if (purchase.purchaseData && Array.isArray(purchase.purchaseData.cart)) {
                // Calculate totalPrice if it's missing.
                if (!purchase.purchaseData.totalPrice) {
                    const calculatedTotal = purchase.purchaseData.cart.reduce((total: number, item: CartItem) => {
                        const price = typeof item.price === 'number' ? item.price : 0;
                        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                        return total + (price * quantity);
                    }, 0);
                    
                    enhancedPurchase.purchaseData = {
                        ...enhancedPurchase.purchaseData,
                        totalPrice: calculatedTotal
                    };
                }

                // Always calculate itemCount from the cart data for consistency.
                const calculatedItemCount = purchase.purchaseData.cart.reduce((count: number, item: CartItem) => {
                    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                    return count + quantity;
                }, 0);

                enhancedPurchase.itemCount = calculatedItemCount;
            }
            
            return enhancedPurchase;
        });

        return NextResponse.json(purchasesWithEnhancements);

    } catch (e) {
        console.error("API route /api/db/purchases error:", e);
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

export async function POST(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
        let userId: number = 1; // Default to guest user ID

        if (token && token.email && token.idToken) {
            try {
                const userResponse = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/User/getUserByEmail?email=${token.email}`, {
                    headers: { 'Authorization': `Bearer ${token.idToken}` }
                });
                if (userResponse.data && userResponse.data.userId) {
                    userId = userResponse.data.userId;
                }
            } catch (error) {
                console.error("Could not fetch user by email, proceeding as guest. Error:", error);
            }
        }

        // Get the pre-formatted payload from the frontend
        const requestData = await request.json();

        // Combine the server-determined userId with the frontend payload
        const payload = { 
            userId: userId, 
            ...requestData
        };

        const response = await axios.post(`${NEXT_PUBLIC_API_BASE_URL}/Purchase/createPurchase`, payload);

        return NextResponse.json(response.data);

    } catch (e) {
        console.error("API route /api/db/purchase error:", e);

        if (axios.isAxiosError(e)) {
            const err = e as AxiosError;
            return NextResponse.json(
                { message: err.message, details: err.response?.data },
                { status: err.response?.status || 500, statusText: "API call failed" }
            );
        }

        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
