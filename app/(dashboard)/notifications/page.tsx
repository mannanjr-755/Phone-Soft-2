'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { useToast } from '@/components/providers/toast-provider'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { Bell, Wrench, Shield, FileText, DollarSign, TrendingDown, Loader2 } from 'lucide-react'
import type { Notification } from '@/types'

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MAINTENANCE_DUE: Wrench,
  INSURANCE_EXPIRY: Shield,
  REGISTRATION_EXPIRY: FileText,
  PARTNERSHIP_PAYMENT: DollarSign,
  HIGH_EXPENSE: TrendingDown,
  LOW_PROFIT: TrendingDown,
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load notifications')
      setNotifications(data.notifications)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load notifications', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Notifications" description="Alerts for maintenance, payments, and business events" />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading notifications...
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium">No notifications yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Alerts will appear here when new business events are recorded.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? Bell
              return (
                <Card key={n.id} className={!n.read ? 'border-primary/30 bg-primary/5' : ''}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="rounded-lg bg-muted p-2"><Icon className="h-5 w-5" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{n.title}</p>
                        {!n.read && <Badge className="bg-primary text-primary-foreground border-0 text-[10px]">New</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                    </div>
                    <DeleteItemButton
                      label={n.title}
                      loading={deletingId === n.id}
                      onDelete={async () => {
                        setDeletingId(n.id)
                        try {
                          const res = await fetch(`/api/notifications/${n.id}`, { method: 'DELETE' })
                          const data = await res.json()
                          if (!res.ok) throw new Error(data.error ?? 'Failed to delete notification')
                          setNotifications((prev) => prev.filter((x) => x.id !== n.id))
                          toast('Notification deleted')
                        } catch (error) {
                          toast(error instanceof Error ? error.message : 'Failed to delete notification', 'error')
                        } finally {
                          setDeletingId(null)
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
