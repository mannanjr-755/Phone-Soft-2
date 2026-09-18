import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'

const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS "SyncRecord" (
    "id" TEXT NOT NULL,
    "clientOpId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SyncRecord_pkey" PRIMARY KEY ("id")
  )
`

const INDEX_SQL = `
  CREATE UNIQUE INDEX IF NOT EXISTS "SyncRecord_clientOpId_key" ON "SyncRecord"("clientOpId")
`

/**
 * Ensures the deduplication table exists before syncing. This makes the sync
 * endpoint resilient even when migrations have not been applied yet on the
 * target database.
 */
export async function ensureSyncTable(): Promise<void> {
  await prisma.$executeRawUnsafe(TABLE_SQL)
  await prisma.$executeRawUnsafe(INDEX_SQL)
}

export async function isOperationClaimed(clientOpId: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "SyncRecord" WHERE "clientOpId" = ${clientOpId} LIMIT 1
  `
  return rows.length > 0
}

/**
 * Records a successfully applied operation so it can never be applied twice.
 * Returns true when the row was inserted (first time) and false when the
 * operation was already recorded (duplicate sync attempt).
 */
export async function recordSyncedOperation(clientOpId: string, method: string, path: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "SyncRecord" ("id", "clientOpId", "method", "path", "createdAt")
    VALUES (${randomUUID()}, ${clientOpId}, ${method}, ${path}, NOW())
    ON CONFLICT ("clientOpId") DO NOTHING
    RETURNING "id"
  `
  return rows.length > 0
}