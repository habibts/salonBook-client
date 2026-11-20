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

const TokenStoreContext = createContext<TokenStoreContextType | null>(null)

export function TokenStoreProvider({ children }: { children: ReactNode }) {
  const [tokenData, setTokenDataState] = useState<JwtTokenData | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const [restorationError, setRestorationError] = useState<string | null>(null)
  const [isIssuing, setIsIssuing] = useState(false)

  const { data: session } = authClient.useSession()

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

  // Session restoration effect with retry logic
  useEffect(() => {
    let cancelled = false
    let retryCount = 0
    const MAX_RETRIES = 3
    const BASE_DELAY_MS = 1000

    async function restoreSession() {
      // Skip if we already have a token (check both ref and state)
      if (tokenDataRef.current?.token || tokenData?.token) {
        setIsRestoring(false)
        notifyRestorationComplete()
        return
      }

      // Skip if no session yet (still loading)
      if (!session) {
        return
      }

      // Skip if session is explicitly null (logged out)
      if (!session.user) {
        setIsRestoring(false)
        notifyRestorationComplete()
        return
      }

      // Prevent duplicate issuance
      if (isIssuing) {
        return
      }

      setIsIssuing(true)
      setRestorationError(null)

      async function attemptRestoration() {
        try {
          const result = await issueJWT()
          
          if (cancelled) return

          if (result.success && result.data) {
            setTokenDataState(result.data)
          } else if (result.error) {
            // Only set error if it's not a 401 (which means no session)
            if (!result.error.includes('Unauthorized') && !result.error.includes('401')) {
              // Check if it's a network error that we should retry
              const isNetworkError = result.error.toLowerCase().includes('network') || 
                                   result.error.toLowerCase().includes('fetch') ||
                                   result.error.toLowerCase().includes('timeout')
              
              if (isNetworkError && retryCount < MAX_RETRIES) {
                retryCount++
                const delay = BASE_DELAY_MS * Math.pow(2, retryCount - 1) // Exponential backoff: 1s, 2s, 4s
                await new Promise((resolve) => setTimeout(resolve, delay))
                if (!cancelled) {
                  await attemptRestoration()
                }
                return
              }
              
              setRestorationError(result.error)
            }
          }
        } catch {
          if (!cancelled) {
            const isRetryable = retryCount < MAX_RETRIES
            if (isRetryable) {
              retryCount++
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount - 1)
              await new Promise((resolve) => setTimeout(resolve, delay))
              if (!cancelled) {
                await attemptRestoration()
              }
              return
            }
            setRestorationError('Failed to restore session')
          }
        }
      }

      await attemptRestoration()

      if (!cancelled) {
        setIsIssuing(false)
        setIsRestoring(false)
        notifyRestorationComplete()
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [session, isIssuing, tokenData])

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
    }, 10000)
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