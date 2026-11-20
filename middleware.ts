import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT, JWT_COOKIE_NAME } from '@/lib/jwt'

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

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => pathname === publicPath || pathname.startsWith(publicPath + '/'))
}

function isCustomerPath(pathname: string): boolean {
  return CUSTOMER_PATHS.some((customerPath) => pathname === customerPath || pathname.startsWith(customerPath + '/'))
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((adminPath) => pathname === adminPath || pathname.startsWith(adminPath + '/'))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(JWT_COOKIE_NAME)?.value

  if (!token) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  const payload = await verifyJWT(token)

  if (!payload) {
    const response = NextResponse.redirect(new URL('/sign-in', request.url))
    response.cookies.set(JWT_COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return response
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