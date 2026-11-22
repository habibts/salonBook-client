import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT, JWT_COOKIE_NAME, signJWT } from '@/lib/jwt'
import type { JWTSessionPayload } from '@/lib/jwt'

const PUBLIC_PATHS = [
  '/',
  '/sign-in',
  '/sign-up',
  '/services',
  '/api/auth',
  '/api/checkout_sessions',
]

const CUSTOMER_PATHS = ['/customer', '/book-appointment', '/payment']
const ADMIN_PATHS = ['/admin', '/dashboard/admin']

const BETTER_AUTH_URL = (process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/+$/, '')

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => pathname === publicPath || pathname.startsWith(publicPath + '/'))
}

function isCustomerPath(pathname: string): boolean {
  return CUSTOMER_PATHS.some((customerPath) => pathname === customerPath || pathname.startsWith(customerPath + '/'))
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((adminPath) => pathname === adminPath || pathname.startsWith(adminPath + '/'))
}

async function getBetterAuthSession(cookieHeader: string | null) {
  if (!cookieHeader) return null

  try {
    const response = await fetch(`${BETTER_AUTH_URL}/api/auth/get-session`, {
      headers: { cookie: cookieHeader },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return null

    const session = await response.json()
    return session && session.user ? session : null
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(JWT_COOKIE_NAME)?.value
  const cookieHeader = request.headers.get('cookie')

  let payload = token ? await verifyJWT(token) : null

  // If JWT is missing or invalid, fall back to Better Auth session
  if (!payload) {
    const session = await getBetterAuthSession(cookieHeader)

    if (session) {
      // Issue new JWT from valid Better Auth session
      const { resolveDashboardRole } = await import('@/lib/roles')
      const role = resolveDashboardRole(session.user)

      const newToken = await signJWT({
        userId: session.user.id,
        email: session.user.email,
        role,
        name: session.user.name ?? undefined,
      })

      const newPayload: JWTSessionPayload = {
        userId: session.user.id,
        email: session.user.email,
        role,
        name: session.user.name,
        jti: '',
      }

      const response = NextResponse.next()
      response.cookies.set(JWT_COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', newPayload.userId)
      requestHeaders.set('x-user-email', newPayload.email)
      requestHeaders.set('x-user-role', newPayload.role)

      return NextResponse.next({ request: { headers: requestHeaders } })
    }
  }

  // At this point, payload is guaranteed to be non-null (either from JWT or newly issued)
  if (!payload) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (isAdminPath(pathname) && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/customer/dashboard', request.url))
  }

  if (isCustomerPath(pathname) && payload.role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}