import type { OfflineOperation } from './types'

const DB_NAME = 'cell-craft-offline'
const STORE_NAME = 'pending-ops'
const DB_VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'clientOpId' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open offline database'))
  })
  return dbPromise
}

export async function getPendingOperations(): Promise<OfflineOperation[]> {
  const db = await openDatabase()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const index = store.index('createdAt')
  const cursorReq = index.openCursor(null, 'next')
  const ops: OfflineOperation[] = []
  return new Promise((resolve, reject) => {
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result
      if (cursor) {
        ops.push(cursor.value as OfflineOperation)
        cursor.continue()
      } else {
        resolve(ops)
      }
    }
    cursorReq.onerror = () => reject(cursorReq.error ?? new Error('Failed to read offline data'))
  })
}

export async function getPendingCount(): Promise<number> {
  try {
    const ops = await getPendingOperations()
    return ops.length
  } catch {
    return 0
  }
}

export async function enqueueOperation(op: OfflineOperation): Promise<void> {
  const db = await openDatabase()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.put(op)
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save offline data'))
    tx.onabort = () => reject(tx.error ?? new Error('Failed to save offline data'))
  })
}

export async function removeOperations(clientOpIds: string[]): Promise<void> {
  if (clientOpIds.length === 0) return
  const db = await openDatabase()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  for (const id of clientOpIds) {
    store.delete(id)
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to update offline data'))
    tx.onabort = () => reject(tx.error ?? new Error('Failed to update offline data'))
  })
}

export async function hasPendingOperations(): Promise<boolean> {
  return (await getPendingCount()) > 0
}