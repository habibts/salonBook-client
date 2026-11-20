'use client'

import { getTokenData, getIsRestoring, getRestorationError } from '@/lib/token-store'

const EXPRESS_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type ErrorPayload = { error?: unknown; message?: unknown }

async function readError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as ErrorPayload | null
  const message = payload?.error ?? payload?.message

  if (typeof message === 'string' && message.trim().length > 0) {
    return message
  }

  if (response.status === 401) {
    return 'Your session has expired. Please sign in again.'
  }

  return `Request failed with status ${response.status}.`
}

export class ExpressApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ExpressApiError'
    this.status = status
  }
}

export function useExpressApi() {
  async function expressFetch<T>(input: string, init?: RequestInit): Promise<T> {
    // If no token but restoration is in progress, wait for it
    if (!getTokenData()?.token && getIsRestoring()) {
      await waitForRestoration()
    }

    // Check again after waiting
    const token = getTokenData()?.token

    // If still no token, throw authentication error
    if (!token) {
      const errorMsg = getRestorationError() || 'Not authenticated'
      throw new ExpressApiError(errorMsg, 401)
    }

    const headers: HeadersInit = {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    }

    const response = await fetch(`${EXPRESS_API_BASE}${input}`, {
      ...init,
      headers,
      cache: 'no-store',
    })

    // If 401, token might be expired or revoked - try to restore once
    if (response.status === 401) {
      // Clear invalid token - we need to import clearTokenData
      // For now, just try to restore
      await waitForRestoration()
      
      const newToken = getTokenData()?.token
      
      if (newToken) {
        // Retry with new token
        const retryHeaders: HeadersInit = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        }
        const retryResponse = await fetch(`${EXPRESS_API_BASE}${input}`, {
          ...init,
          headers: retryHeaders,
          cache: 'no-store',
        })
        
        if (!retryResponse.ok) {
          throw new ExpressApiError(await readError(retryResponse), retryResponse.status)
        }
        return (await retryResponse.json()) as T
      }
      
      // No new token available after restoration
      throw new ExpressApiError('Session expired. Please sign in again.', 401)
    }

    if (!response.ok) {
      throw new ExpressApiError(await readError(response), response.status)
    }

    return (await response.json()) as T
  }

  return { expressFetch }
}

// Wait for authentication restoration to complete
async function waitForRestoration(): Promise<void> {
  return new Promise((resolve) => {
    const checkRestoration = () => {
      if (!getIsRestoring()) {
        resolve()
      } else {
        setTimeout(checkRestoration, 50)
      }
    }
    checkRestoration()
  })
}

export async function expressLogout(token: string): Promise<void> {
  try {
    await fetch(`${EXPRESS_API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    // Ignore errors on logout
  }
}