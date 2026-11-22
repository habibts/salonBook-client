import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
})

export const { signIn, signUp, useSession, signOut } = authClient

export interface JwtTokenData {
  token: string
  user: {
    id: string
    email: string
    name: string | null
    role: 'customer' | 'admin'
    image?: string | null
    createdAt?: Date | string | null
  }
}

export async function issueJWT(): Promise<{ success: boolean; data?: JwtTokenData; error?: string }> {
  try {
    const response = await fetch('/api/auth/jwt/issue', {
      method: 'POST',
      credentials: 'include',
    })
    const data = await response.json()
    if (!response.ok) {
      return { success: false, error: data.error ?? 'Failed to issue JWT' }
    }
    return { success: true, data: { token: data.token, user: data.user } }
  } catch {
    return { success: false, error: 'Network error' }
  }
}

export async function clearJWT(): Promise<void> {
  try {
    await fetch('/api/auth/jwt/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Ignore errors on logout
  }
}