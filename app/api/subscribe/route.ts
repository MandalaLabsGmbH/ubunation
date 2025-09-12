import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, socialFollowers, socialLink } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiGatewayUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscribe`;
    
    // The payload sent to Lambda will now contain all fields
    const payload = {
      email,
      name, // Will be undefined for newsletter, which is fine
      socialFollowers,
      socialLink
    };

    const response = await axios.post(apiGatewayUrl, payload);

    return NextResponse.json(response.data, { status: 200 });

  } catch (error) {
    console.error('Failed to call subscribe lambda:', error);
    if (axios.isAxiosError(error) && error.response) {
       return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}