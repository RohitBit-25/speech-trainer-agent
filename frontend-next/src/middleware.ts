import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup'];

// Define protected routes that require authentication
const protectedRoutes = ['/studio', '/practice', '/history', '/analysis', '/feedback', '/comparison', '/settings', '/leaderboard', '/challenges'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.includes(pathname);

    // Get token from cookie or check localStorage (we'll use a cookie for SSR)
    const token = request.cookies.get('auth_token')?.value;

    // If accessing a protected route without a token, redirect to login
    if (isProtectedRoute && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // If accessing login/signup with a token, redirect to studio
    if ((pathname === '/login' || pathname === '/signup') && token) {
        const url = request.nextUrl.clone();
        url.pathname = '/studio';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
