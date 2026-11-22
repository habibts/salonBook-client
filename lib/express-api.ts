'use client'

import { clearTokenDataModule, getTokenData, setTokenDataModule, waitForRestorationEvent } from '@/lib/token-store'

const EXPRESS_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const FETCH_TIMEOUT_MS = 10000

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

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    })
    return response
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ExpressApiError('Request timeout. Please check your connection.', 408)
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }
}

export function useExpressApi() {
  async function expressFetch<T>(input: string, init?: RequestInit): Promise<T> {
    // Wait for token restoration if in progress
    await waitForRestorationEvent()

    // Get token from token-store (which gets it from API, not cookie)
    const token = getTokenData()?.token

    if (!token) {
      throw new ExpressApiError('Not authenticated', 401)
    }

    const headers: HeadersInit = {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    }

    const response = await fetchWithTimeout(`${EXPRESS_API_BASE}${input}`, {
      ...init,
      headers,
      cache: 'no-store',
    })

    // If 401, token might be expired or revoked - try to refresh once via API
    if (response.status === 401) {
      // Clear invalid token
      clearTokenDataModule()

      // Try to issue new JWT via API
      try {
        const { issueJWT } = await import('@/lib/auth-client')
        const result = await issueJWT()
        if (result.success && result.data) {
          // Manually update token-store with new token data
          setTokenDataModule(result.data)
          
          const newToken = result.data.token
          if (newToken) {
            // Retry with new token
            const retryHeaders: HeadersInit = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            }
            const retryResponse = await fetchWithTimeout(`${EXPRESS_API_BASE}${input}`, {
              ...init,
              headers: retryHeaders,
              cache: 'no-store',
            })

            if (!retryResponse.ok) {
              throw new ExpressApiError(await readError(retryResponse), retryResponse.status)
            }
            return (await retryResponse.json()) as T
          }
        }
      } catch {
        // Ignore refresh errors
      }

      // Refresh failed - throw error
      throw new ExpressApiError('Session expired. Please sign in again.', 401)
    }

    if (!response.ok) {
      throw new ExpressApiError(await readError(response), response.status)
    }

    return (await response.json()) as T
  }

  return { expressFetch }
}

export async function expressLogout(token: string): Promise<void> {
  try {
    await fetchWithTimeout(`${EXPRESS_API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    // Ignore errors on logout
  }
}