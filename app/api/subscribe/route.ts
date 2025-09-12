import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // This is the full URL to your API Gateway endpoint
    const apiGatewayUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscribe`;

    // Call your Lambda function via API Gateway
    const response = await axios.post(apiGatewayUrl, { email });

    // Forward the successful response from the Lambda
    return NextResponse.json(response.data, { status: 200 });

  } catch (error) {
    console.error('Failed to call subscribe lambda:', error);
    // Forward the error response
    if (axios.isAxiosError(error) && error.response) {
       return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}