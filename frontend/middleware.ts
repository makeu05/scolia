import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessibles sans authentification
const PUBLIC_ROUTES = ['/login', '/register', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les routes publiques
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Vérifier le token dans les cookies (pour SSR)
  // Note : localStorage n'est pas accessible ici, utiliser un cookie côté client
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/students/:path*',
    '/teachers/:path*',
    '/classes/:path*',
    '/settings/:path*',
  ],
};