const FETCH_TIMEOUT_MS = 10000

export async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(input, { ...init, signal: controller.signal })
    return response
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection.')
    }
    throw e
  } finally {
    clearTimeout(timeoutId)
  }
}