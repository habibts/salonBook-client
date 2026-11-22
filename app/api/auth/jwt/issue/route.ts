import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { signJWT, JWT_COOKIE_NAME, getJWTCookieOptions } from '@/lib/jwt'
import { resolveDashboardRole } from '@/lib/roles'

export async function POST() {
  const authInstance = await auth;
  const headersList = await headers()
  const session = await authInstance!.api.getSession({ headers: headersList })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = resolveDashboardRole(session.user)

  const token = await signJWT({
    userId: session.user.id,
    email: session.user.email,
    role,
    name: session.user.name ?? undefined,
  })

  const response = NextResponse.json({
    success: true,
    token,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role,
      image: session.user.image,
      createdAt: session.user.createdAt,
    },
  })

  response.cookies.set(JWT_COOKIE_NAME, token, getJWTCookieOptions())

  return response
}