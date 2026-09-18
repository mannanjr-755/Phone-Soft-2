import { enqueueOperation } from './queue'
import type { OfflineMethod, OfflineOperation } from './types'

export const OFFLINE_QUEUE_EVENT = 'cellcraft:offline-queue-changed'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const IGNORED_PATHS = ['/api/sync']

let installed = false

function isMutating(method: string): method is OfflineMethod {
  return MUTATING_METHODS.has(method.toUpperCase())
}

async function readRequestBody(input: RequestInfo | URL, init?: RequestInit): Promise<unknown> {
  if (init && init.body !== undefined) return init.body
  if (typeof input !== 'string' && !(input instanceof URL) && input.bodyUsed === false) {
    try {
      return await input.clone().text()
    } catch {
      return undefined
    }
  }
  return undefined
}

function createOfflineResponse(clientOpId: string): Response {
  return new Response(
    JSON.stringify({ offlineQueued: true, offlineId: clientOpId, message: 'Saved offline. Ready to sync when you are back online.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

/**
 * Installs a thin wrapper around `window.fetch` that captures mutating
 * requests to the CRM API and stores them locally when the browser is
 * offline. Online behavior is left completely untouched.
 *
 * Safe to call multiple times (no-op after the first install).
 */
export function installOfflineInterceptor(): void {
  if (installed || typeof window === 'undefined') return
  installed = true

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = (
      init?.method ?? (typeof input === 'string' || input instanceof URL ? 'GET' : input.method)
    ).toUpperCase()

    if (!url.startsWith('/api/')) return originalFetch(input, init)
    if (IGNORED_PATHS.some((p) => url.startsWith(p))) return originalFetch(input, init)
    if (!isMutating(method)) return originalFetch(input, init)

    const queueLocally = async (): Promise<Response> => {
      const op: OfflineOperation = {
        clientOpId: crypto.randomUUID(),
        url,
        method,
        body: await readRequestBody(input, init),
        createdAt: Date.now(),
        status: 'pending',
      }
      try {
        await enqueueOperation(op)
      } catch {
        return originalFetch(input, init)
      }
      window.dispatchEvent(new Event(OFFLINE_QUEUE_EVENT))
      return createOfflineResponse(op.clientOpId)
    }

    if (navigator.onLine === false) return queueLocally()

    try {
      return await originalFetch(input, init)
    } catch {
      return queueLocally()
    }
  }
}