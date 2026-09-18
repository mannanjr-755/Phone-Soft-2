'use client'

import { MachineryProvider } from './machinery-provider'
import { ToastProvider } from './toast-provider'
import { OfflineSyncProvider } from './offline-sync-provider'

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <OfflineSyncProvider>
        <MachineryProvider>{children}</MachineryProvider>
      </OfflineSyncProvider>
    </ToastProvider>
  )
}
