import { NextResponse, NextRequest } from "next/server";
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(request: NextRequest) {
    try {
       
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");

        // Check if the projectId is provided in the request.
        if (!projectId) {
            return NextResponse.json({ message: 'Bad Request: projectId must be provided' }, { status: 400 });
        }

        // Make the API call to get the project data.
        const response = await axios.get(`${API_BASE_URL}/Project/getProjectByProjectId`, {
            params: { projectId },
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
