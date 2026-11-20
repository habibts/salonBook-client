import { NextResponse } from 'next/server'
import { JWT_COOKIE_NAME, getClearJWTCookieOptions } from '@/lib/jwt'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(JWT_COOKIE_NAME, '', getClearJWTCookieOptions())
  return response
}