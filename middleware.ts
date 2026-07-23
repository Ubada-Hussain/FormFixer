import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/compress(.*)',
  '/convert(.*)',
]);

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidKey = Boolean(
    publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('YOUR_PUBLISHABLE_KEY')
  );

  if (!isValidKey) {
    return NextResponse.next();
  }
  return clerkMiddleware((auth, request) => {
    if (isProtectedRoute(request)) {
      auth().protect();
    }
  })(req, evt);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webmanifest|fontawesome|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
