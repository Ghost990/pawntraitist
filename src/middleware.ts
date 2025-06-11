import { NextResponse } from 'next/server';

export function middleware() {
  // Check if the Replicate API token is set
  if (!process.env.REPLICATE_API_TOKEN) {
    console.warn('REPLICATE_API_TOKEN is not set. API calls to Replicate will fail.');
  }
  
  return NextResponse.next();
}

// Only run the middleware on API routes
export const config = {
  matcher: '/api/:path*',
};
