'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { useToast } from '@/components/providers/toast-provider'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Receivable = {
  id: string
  client: string
  invoice: string
  amount: number
  dueDate: string
  status: string
}

export default function ReceivablesPage() {
  const { toast } = useToast()
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchReceivables = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/receivables')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load receivables')
      setReceivables(data.receivables)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load receivables', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchReceivables()
  }, [fetchReceivables])

  const handleDelete = async (item: Receivable) => {
    setDeletingId(item.id)
    try {
      const res = await fetch(`/api/receivables/${item.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete receivable')
      setReceivables((prev) => prev.filter((r) => r.id !== item.id))
      toast('Receivable deleted')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete receivable', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'client', header: 'Client', sortable: true },
    { key: 'invoice', header: 'Invoice', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, render: (i: Receivable) => formatCurrency(i.amount) },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (i: Receivable) => formatDate(i.dueDate) },
    { key: 'status', header: 'Status', sortable: true, render: (i: Receivable) => (
      <span className={i.status === 'Overdue' ? 'text-red-500 font-medium' : ''}>{i.status}</span>
    )},
    {
      key: 'actions',
      header: '',
      render: (item: Receivable) => (
        <DeleteItemButton label={`${item.client} (${item.invoice})`} loading={deletingId === item.id} onDelete={() => handleDelete(item)} />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts Receivable" description="Outstanding client payments" />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading receivables...
        </div>
      ) : (
        <DataTable data={receivables} columns={columns} searchKey="client" />
      )}
    </div>
  )
}
