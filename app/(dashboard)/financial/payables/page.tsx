'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { useToast } from '@/components/providers/toast-provider'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Payable = {
  id: string
  vendor: string
  invoice: string
  amount: number
  dueDate: string
  status: string
}

export default function PayablesPage() {
  const { toast } = useToast()
  const [payables, setPayables] = useState<Payable[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPayables = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payables')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load payables')
      setPayables(data.payables)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load payables', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPayables()
  }, [fetchPayables])

  const handleDelete = async (item: Payable) => {
    setDeletingId(item.id)
    try {
      const res = await fetch(`/api/payables/${item.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete payable')
      setPayables((prev) => prev.filter((p) => p.id !== item.id))
      toast('Payable deleted')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete payable', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'vendor', header: 'Vendor', sortable: true },
    { key: 'invoice', header: 'Bill', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, render: (i: Payable) => formatCurrency(i.amount) },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (i: Payable) => formatDate(i.dueDate) },
    { key: 'status', header: 'Status', sortable: true, render: (i: Payable) => (
      <span className={i.status === 'Overdue' ? 'text-red-500 font-medium' : ''}>{i.status}</span>
    )},
    {
      key: 'actions',
      header: '',
      render: (item: Payable) => (
        <DeleteItemButton label={`${item.vendor} (${item.invoice})`} loading={deletingId === item.id} onDelete={() => handleDelete(item)} />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts Payable" description="Outstanding vendor payments" />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading payables...
        </div>
      ) : (
        <DataTable data={payables} columns={columns} searchKey="vendor" />
      )}
    </div>
  )
}
