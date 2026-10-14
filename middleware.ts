import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await getSession(request.cookies)

    if (!session.isLoggedIn) {
      const callbackUrl = request.url
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}