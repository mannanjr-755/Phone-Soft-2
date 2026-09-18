import type { OfflineOperation } from '@/lib/offline/types'

type RouteHandler = (...args: any[]) => Promise<Response>

interface RouteModule {
  POST?: RouteHandler
  PUT?: RouteHandler
  PATCH?: RouteHandler
  DELETE?: RouteHandler
}

interface RouteEntry {
  base?: () => Promise<RouteModule>
  item?: () => Promise<RouteModule>
}

const ROUTES: Record<string, RouteEntry> = {
  customers: {
    base: () => import('@/app/api/customers/route'),
    item: () => import('@/app/api/customers/[id]/route'),
  },
  suppliers: {
    base: () => import('@/app/api/suppliers/route'),
    item: () => import('@/app/api/suppliers/[id]/route'),
  },
  products: {
    base: () => import('@/app/api/products/route'),
    item: () => import('@/app/api/products/[id]/route'),
  },
  purchases: {
    base: () => import('@/app/api/purchases/route'),
    item: () => import('@/app/api/purchases/[id]/route'),
  },
  'cash-bank': {
    base: () => import('@/app/api/cash-bank/route'),
    item: () => import('@/app/api/cash-bank/[id]/route'),
  },
  accounting: {
    base: () => import('@/app/api/accounting/route'),
    item: () => import('@/app/api/accounting/[id]/route'),
  },
  categories: {
    base: () => import('@/app/api/categories/route'),
    item: () => import('@/app/api/categories/[id]/route'),
  },
  credits: {
    base: () => import('@/app/api/credits/route'),
    item: () => import('@/app/api/credits/[id]/route'),
  },
  sales: {
    base: () => import('@/app/api/sales/route'),
    item: () => import('@/app/api/sales/[id]/route'),
  },
  expenses: {
    base: () => import('@/app/api/expenses/route'),
    item: () => import('@/app/api/expenses/[id]/route'),
  },
  machines: {
    base: () => import('@/app/api/machines/route'),
    item: () => import('@/app/api/machines/[id]/route'),
  },
  transactions: { item: () => import('@/app/api/transactions/[id]/route') },
  payables: { item: () => import('@/app/api/payables/[id]/route') },
  receivables: { item: () => import('@/app/api/receivables/[id]/route') },
  'bank-accounts': { item: () => import('@/app/api/bank-accounts/[id]/route') },
  partnerships: { item: () => import('@/app/api/partnerships/[id]/route') },
  notifications: { item: () => import('@/app/api/notifications/[id]/route') },
  users: { item: () => import('@/app/api/users/[id]/route') },
}

interface SpecialRoute {
  test: (segments: string[]) => boolean
  load: () => Promise<RouteModule>
  param: string
}

const SPECIAL_ROUTES: SpecialRoute[] = [
  {
    test: (s) => s.length === 3 && s[0] === 'expenses' && s[1] === 'reports',
    load: () => import('@/app/api/expenses/reports/[monthKey]/route'),
    param: 'monthKey',
  },
  {
    test: (s) => s.length === 3 && s[0] === 'partnerships' && s[1] === 'partners',
    load: () => import('@/app/api/partnerships/partners/[id]/route'),
    param: 'id',
  },
]

const REPLAY_ORIGIN = 'https://cellcraft.local'

export interface ApplyOutcome {
  status: 'synced' | 'failed'
  error?: string
}

/**
 * Applies a single queued operation by replaying it through the existing
 * route handler, so all validation and business logic stay exactly the same.
 */
export async function applyOperation(op: OfflineOperation): Promise<ApplyOutcome> {
  const segments = op.url.replace(/^\/api\//, '').split('/').filter(Boolean)
  if (segments.length === 0 || segments.length > 3) {
    return { status: 'failed', error: `Unsupported sync path: ${op.url}` }
  }

  const method = op.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  let routeModule: RouteModule
  let id: string | undefined
  let idParam = 'id'

  const special = SPECIAL_ROUTES.find((r) => r.test(segments))
  if (special) {
    routeModule = await special.load()
    id = segments[2]
    idParam = special.param
  } else if (segments.length === 3) {
    return { status: 'failed', error: `Unsupported sync path: ${op.url}` }
  } else if (segments.length === 2) {
    const entry = ROUTES[segments[0]]
    if (!entry?.item) return { status: 'failed', error: `Unsupported sync path: ${op.url}` }
    routeModule = await entry.item()
    id = segments[1]
  } else {
    const entry = ROUTES[segments[0]]
    if (!entry?.base) return { status: 'failed', error: `Unsupported sync path: ${op.url}` }
    routeModule = await entry.base()
  }

  const handler = routeModule[method]
  if (!handler) return { status: 'failed', error: `${method} is not supported on ${op.url}` }

  const request = new Request(`${REPLAY_ORIGIN}${op.url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: op.body === undefined ? undefined : typeof op.body === 'string' ? op.body : JSON.stringify(op.body),
  })

  try {
    const response =
      id === undefined
        ? await (handler as (request: Request) => Promise<Response>)(request)
        : await (handler as (request: Request, context: { params: Promise<{ [key: string]: string }> }) => Promise<Response>)(
            request,
            { params: Promise.resolve({ [idParam]: id }) },
          )

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      return {
        status: 'failed',
        error: (data?.error as string | undefined) ?? `Sync returned status ${response.status}`,
      }
    }
    return { status: 'synced' }
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : 'Sync operation failed' }
  }
}