import { NextResponse } from 'next/server'
import { getDbErrorMessage } from '@/lib/db/errors'
import { applyOperation } from '@/lib/sync/replay'
import { ensureSyncTable, isOperationClaimed, recordSyncedOperation } from '@/lib/sync/sync-record'
import type { SyncPayload, SyncResult } from '@/lib/offline/types'

export const dynamic = 'force-dynamic'

const MAX_BATCH_SIZE = 500

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<SyncPayload>
    const ops = Array.isArray(body.ops) ? body.ops : []
    if (ops.length === 0) {
      return NextResponse.json({ results: [] })
    }
    if (ops.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: 'Too many operations in a single sync request' }, { status: 400 })
    }

    await ensureSyncTable()

    const ordered = [...ops].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
    const results: SyncResult[] = []

    for (const op of ordered) {
      const { clientOpId, url, method } = op
      if (!clientOpId || !url || !method) {
        results.push({ clientOpId: clientOpId ?? '', status: 'failed', error: 'Invalid operation' })
        continue
      }

      const alreadySynced = await isOperationClaimed(clientOpId)
      if (alreadySynced) {
        results.push({ clientOpId, status: 'deduped' })
        continue
      }

      const outcome = await applyOperation(op)
      if (outcome.status === 'failed') {
        results.push({ clientOpId, status: 'failed', error: outcome.error })
        continue
      }

      await recordSyncedOperation(clientOpId, method, url.replace(/^\/api\//, ''))
      results.push({ clientOpId, status: 'synced' })
    }

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}