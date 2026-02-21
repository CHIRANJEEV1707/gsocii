import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url)
  const response = NextResponse.next()

  // 1. Referral Capture
  const referralCode = searchParams.get('ref')
  if (referralCode) {
    // Store referral code in cookie for 7 days
    response.cookies.set('referral_code', referralCode, {
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })

    // Note: We don't track the click in the database here because middleware
    // should be fast and non-blocking. We'll handle click tracking via a 
    // client-side useEffect or a background API call later if needed,
    // or just rely on the cookie for the final conversion.
  }

  // 2. Admin Route Protection
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

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
}
