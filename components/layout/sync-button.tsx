'use client'

import { RefreshCw, CloudUpload, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOfflineSync } from '@/components/providers/offline-sync-provider'
import { cn } from '@/lib/utils'

export function SyncButton() {
  const { isOnline, isSyncing, pendingCount, syncNow } = useOfflineSync()
  const hasPending = pendingCount > 0

  const label = hasPending
    ? isOnline
      ? `${pendingCount} pending change(s) - Sync Data`
      : `${pendingCount} pending change(s) saved offline`
    : 'Sync data'

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={syncNow}
        disabled={isSyncing}
        title={label}
        aria-label={label}
        className={cn(!isOnline && 'text-amber-400 hover:text-amber-400')}
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : hasPending ? (
          <CloudUpload className={cn('h-4 w-4', isOnline ? 'text-primary' : '')} />
        ) : !isOnline ? (
          <WifiOff className="h-4 w-4" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
      {hasPending && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      )}
    </div>
  )
}