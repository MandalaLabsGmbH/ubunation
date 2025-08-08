import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,
    CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  images: {
    remotePatterns: [
       {
        protocol: 'https',
        hostname: 'ubunation.s3.eu-central-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
