'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { installOfflineInterceptor, OFFLINE_QUEUE_EVENT } from '@/lib/offline/interceptor'
import { getPendingCount, getPendingOperations, removeOperations } from '@/lib/offline/queue'
import type { SyncResult } from '@/lib/offline/types'
import { useToast } from '@/components/providers/toast-provider'

interface OfflineSyncContextValue {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  syncNow: () => Promise<void>
}

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null)

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const wasOfflineRef = useRef(false)
  const syncingRef = useRef(false)

  installOfflineInterceptor()

  const refreshPending = useCallback(async () => {
    setPendingCount(await getPendingCount())
  }, [])

  useEffect(() => {
    refreshPending()
    window.addEventListener(OFFLINE_QUEUE_EVENT, refreshPending)

    const handleOnline = async () => {
      const wasOffline = wasOfflineRef.current
      wasOfflineRef.current = false
      setIsOnline(true)
      if (wasOffline) {
        const pending = await getPendingCount()
        if (pending > 0) {
          toast(`${pending} offline change(s) are ready to sync. Click "Sync Data".`)
        }
      }
    }

    const handleOffline = () => {
      wasOfflineRef.current = true
      setIsOnline(false)
    }

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener(OFFLINE_QUEUE_EVENT, refreshPending)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshPending, toast])

  const syncNow = useCallback(async (): Promise<void> => {
    if (syncingRef.current) return
    if (navigator.onLine === false) {
      toast('You are offline. Connect to the internet to sync.', 'error')
      return
    }

    const ops = await getPendingOperations()
    if (ops.length === 0) {
      toast('Nothing to sync')
      return
    }

    syncingRef.current = true
    setIsSyncing(true)
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ops }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Failed to sync data')

      const results = (Array.isArray(data?.results) ? data.results : []) as SyncResult[]
      const completed = results
        .filter((r) => r.status === 'synced' || r.status === 'deduped')
        .map((r) => r.clientOpId)
      const failed = results.filter((r) => r.status === 'failed')

      if (completed.length > 0) {
        await removeOperations(completed)
      }

      if (failed.length > 0) {
        toast(`${failed.length} record(s) could not be synced and are kept for retry.`, 'error')
      } else {
        toast(`Synced ${completed.length} change(s)`)
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Sync failed', 'error')
    } finally {
      syncingRef.current = false
      setIsSyncing(false)
      await refreshPending()
    }
  }, [refreshPending, toast])

  const value = useMemo<OfflineSyncContextValue>(
    () => ({ isOnline, isSyncing, pendingCount, syncNow }),
    [isOnline, isSyncing, pendingCount, syncNow],
  )

  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>
}

export function useOfflineSync(): OfflineSyncContextValue {
  const ctx = useContext(OfflineSyncContext)
  if (!ctx) throw new Error('useOfflineSync must be used within OfflineSyncProvider')
  return ctx
}