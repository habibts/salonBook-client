/**
 * Minimal fetch wrapper shared by the dashboard pages.
 *
 * Every dashboard request goes through the app's own route handlers, which read
 * the Better Auth session server-side — the browser never sends a user id or a
 * role of its own.
 */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type ErrorPayload = { error?: unknown; message?: unknown }

async function readError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as ErrorPayload | null
  const message = payload?.error ?? payload?.message

  if (typeof message === "string" && message.trim().length > 0) {
    return message
  }

  if (response.status === 401) {
    return "Your session has expired. Please sign in again."
  }

  return `Request failed with status ${response.status}.`
}

export async function apiFetch<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status)
  }

  return (await response.json()) as T
}
