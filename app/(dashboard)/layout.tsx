import { DashboardShell } from '@/components/layout/dashboard-shell'
import { ErrorBoundary } from '@/components/dashboard/error-boundary'
import { DashboardProviders } from '@/components/providers/dashboard-providers'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardShell userName="Admin" userRole="ADMIN">
        <ErrorBoundary>{children}</ErrorBoundary>
      </DashboardShell>
    </DashboardProviders>
  )
}
