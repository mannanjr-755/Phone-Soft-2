export type OfflineMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface OfflineOperation {
  clientOpId: string
  url: string
  method: OfflineMethod
  body: unknown
  createdAt: number
  status: 'pending' | 'failed'
  lastError?: string
}

export type SyncOutcome = 'synced' | 'deduped' | 'failed'

export interface SyncResult {
  clientOpId: string
  status: SyncOutcome
  error?: string
}

export interface SyncPayload {
  ops: OfflineOperation[]
}