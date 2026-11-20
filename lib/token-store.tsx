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

  // Session restoration effect
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      // Skip if we already have a token
      if (tokenDataRef.current?.token) {
        setIsRestoring(false)
        return
      }

      // Skip if no session yet (still loading)
      if (!session) {
        return
      }

      // Skip if session is explicitly null (logged out)
      if (!session.user) {
        setIsRestoring(false)
        return
      }

      // Prevent duplicate issuance
      if (isIssuing) {
        return
      }

      setIsIssuing(true)
      setRestorationError(null)

      try {
        const result = await issueJWT()
        
        if (cancelled) return

        if (result.success && result.data) {
          setTokenDataState(result.data)
        } else if (result.error) {
          // Only set error if it's not a 401 (which means no session)
          if (!result.error.includes('Unauthorized') && !result.error.includes('401')) {
            setRestorationError(result.error)
          }
        }
      } catch {
        if (!cancelled) {
          setRestorationError('Failed to restore session')
        }
      } finally {
        if (!cancelled) {
          setIsIssuing(false)
          setIsRestoring(false)
        }
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [session, isIssuing])

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