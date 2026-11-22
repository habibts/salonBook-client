'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import type { JwtTokenData } from '@/lib/auth-client'
import { authClient, issueJWT } from '@/lib/auth-client'

interface TokenStoreContextType {
  tokenData: JwtTokenData | null
  setTokenData: (data: JwtTokenData | null) => void
  clearTokenData: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isRestoring: boolean
  restorationError: string | null
}

// Module-level refs for accessing state outside React components
let currentTokenData: JwtTokenData | null = null
let currentIsRestoring = true
let currentRestorationError: string | null = null

// Callback registry for restoration completion notifications
const restorationListeners = new Set<() => void>()

function notifyRestorationComplete() {
  restorationListeners.forEach((listener) => listener())
}

function subscribeToRestoration(listener: () => void) {
  restorationListeners.add(listener)
  return () => restorationListeners.delete(listener)
}

// BroadcastChannel for cross-tab logout synchronization
const authBroadcastChannel = typeof window !== 'undefined' ? new BroadcastChannel('salonbook-auth') : null

function broadcastLogout() {
  authBroadcastChannel?.postMessage({ type: 'LOGOUT' })
}

function setupCrossTabLogoutListener(clearTokenData: () => void) {
  if (!authBroadcastChannel) return
  
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'LOGOUT') {
      clearTokenData()
    }
  }
  
  authBroadcastChannel.addEventListener('message', handleMessage)
  return () => authBroadcastChannel.removeEventListener('message', handleMessage)
}

// Function to update token data from outside React components (e.g., after 401 refresh)
export function setTokenDataModule(data: JwtTokenData): void {
  currentTokenData = data
  currentIsRestoring = false
  currentRestorationError = null
  notifyRestorationComplete()
}

const TokenStoreContext = createContext<TokenStoreContextType | null>(null)

export function TokenStoreProvider({ children }: { children: ReactNode }) {
  const [tokenData, setTokenDataState] = useState<JwtTokenData | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const [restorationError, setRestorationError] = useState<string | null>(null)

  const { data: session, isPending } = authClient.useSession()

  // Keep module-level refs in sync with React state
  const tokenDataRef = useRef(tokenData)
  const isRestoringRef = useRef(isRestoring)
  const restorationErrorRef = useRef(restorationError)

  useEffect(() => {
    tokenDataRef.current = tokenData
    currentTokenData = tokenData
  }, [tokenData])

  useEffect(() => {
    isRestoringRef.current = isRestoring
    currentIsRestoring = isRestoring
  }, [isRestoring])

  useEffect(() => {
    restorationErrorRef.current = restorationError
    currentRestorationError = restorationError
  }, [restorationError])

  const setTokenData = useCallback((data: JwtTokenData | null) => {
    setTokenDataState(data)
  }, [])

  const clearTokenData = useCallback(() => {
    setTokenDataState(null)
  }, [])

  const isAuthenticated = !!tokenData?.token
  const isAdmin = tokenData?.user?.role === 'admin'

  // Cross-tab logout synchronization
  useEffect(() => {
    return setupCrossTabLogoutListener(clearTokenData)
  }, [clearTokenData])

  // Session restoration: always use API to issue JWT (cookie is httpOnly, can't read client-side)
  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      // If we already have a valid token, we're done
      if (tokenDataRef.current?.token) {
        if (mounted) {
          setIsRestoring(false)
          notifyRestorationComplete()
        }
        return
      }

      // If Better Auth session is still loading, wait for it
      if (isPending) {
        return
      }

      // If no session (logged out), we're done
      if (!session?.user) {
        if (mounted) {
          setIsRestoring(false)
          notifyRestorationComplete()
        }
        return
      }

      // Issue JWT via API (requires Better Auth session cookie, which is sent automatically)
      try {
        const result = await issueJWT()
        if (result.success && result.data && mounted) {
          setTokenDataState(result.data)
        } else if (!result.success && mounted) {
          setRestorationError(result.error ?? 'Failed to issue JWT')
        }
      } catch {
        // Network error, will retry on next session change
        if (mounted) {
          setRestorationError('Network error during session restoration')
        }
      }

      if (mounted) {
        setIsRestoring(false)
        notifyRestorationComplete()
      }
    }

    restoreSession()

    return () => {
      mounted = false
    }
  }, [session, isPending])

  return (
    <TokenStoreContext.Provider
      value={{
        tokenData,
        setTokenData,
        clearTokenData,
        isAuthenticated,
        isAdmin,
        isRestoring,
        restorationError,
      }}
    >
      {children}
    </TokenStoreContext.Provider>
  )
}

export function useTokenStore() {
  const context = useContext(TokenStoreContext)
  if (!context) {
    throw new Error('useTokenStore must be used within a TokenStoreProvider')
  }
  return context
}

// Functions to access state outside React components (e.g., in express-api.ts)
export function getTokenData(): JwtTokenData | null {
  return currentTokenData
}

export function getIsRestoring(): boolean {
  return currentIsRestoring
}

export function getRestorationError(): string | null {
  return currentRestorationError
}

// Event-based waiting for restoration completion (replaces polling)
export function waitForRestorationEvent(): Promise<void> {
  return new Promise((resolve) => {
    if (!currentIsRestoring) {
      resolve()
      return
    }
    
    const unsubscribe = subscribeToRestoration(() => {
      if (!currentIsRestoring) {
        unsubscribe()
        resolve()
      }
    })
    
    // Fallback timeout in case notification fails
    setTimeout(() => {
      unsubscribe()
      resolve()
    }, 5000)
  })
}

export function broadcastLogoutEvent() {
  broadcastLogout()
}

// Function to clear token data from outside React components
export function clearTokenDataModule(): void {
  currentTokenData = null
  currentIsRestoring = false
  currentRestorationError = null
}