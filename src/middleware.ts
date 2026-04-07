import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public paths that don't require authentication
const publicPaths = [
  '/signin',
  '/api/auth',
  '/api/health',
  '/_next',
  '/favicon.ico',
]

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/admin',
  '/campaigns',
  '/instances',
  '/contacts',
  '/settings',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public paths
  const isPublicPath = publicPaths.some(
    (path) => pathname.startsWith(path)
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // For now, allow all requests in development mode
  // In production, implement proper session validation
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    return NextResponse.next()
  }

  // Production: Check session
  try {
    const sessionCookie = request.cookies.get('better-auth.session_token')
    
    if (!sessionCookie && protectedPaths.some(path => pathname.startsWith(path))) {
      const signinUrl = new URL('/signin', request.url)
      signinUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signinUrl)
    }

    return NextResponse.next()
  } catch (error) {
    // If session check fails, redirect to signin
    const signinUrl = new URL('/signin', request.url)
    return NextResponse.redirect(signinUrl)
  }
}

// Only match routes that need middleware processing
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
