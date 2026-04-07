// Simplified middleware for local testing - skips auth checks
// In production, this should be replaced with proper auth middleware

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Only apply middleware in mock mode or dev
const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
const isDev = process.env.NODE_ENV === 'development'

export function middleware(request: NextRequest) {
  // In mock mode or development, allow all requests
  if (isMockMode || isDev) {
    return NextResponse.next()
  }
  
  // In production, you should implement proper auth checks here
  // For now, just pass through
  return NextResponse.next()
}

// Only match routes that need middleware processing
// This excludes static files and API health checks
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes that don't need auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
