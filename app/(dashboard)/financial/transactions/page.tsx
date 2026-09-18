'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { useToast } from '@/components/providers/toast-provider'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

type Transaction = {
  id: string
  date: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  category: string
}

export default function TransactionsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load transactions')
      setTransactions(data.transactions)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load transactions', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleDelete = async (item: Transaction) => {
    setDeletingId(item.id)
    try {
      const res = await fetch(`/api/transactions/${item.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete transaction')
      setTransactions((prev) => prev.filter((t) => t.id !== item.id))
      toast('Transaction deleted')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete transaction', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'date', header: 'Date', sortable: true, render: (i: Transaction) => formatDate(i.date) },
    { key: 'type', header: 'Type', sortable: true, render: (i: Transaction) => (
      <Badge className={i.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 border-0' : 'bg-red-100 text-red-700 border-0'}>{i.type}</Badge>
    )},
    { key: 'description', header: 'Description', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, render: (i: Transaction) => (
      <span className={i.type === 'INCOME' ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
        {i.type === 'INCOME' ? '+' : '-'}{formatCurrency(i.amount)}
      </span>
    )},
    {
      key: 'actions',
      header: '',
      render: (item: Transaction) => (
        <DeleteItemButton label={item.description} loading={deletingId === item.id} onDelete={() => handleDelete(item)} />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="All financial transactions" />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading transactions...
        </div>
      ) : (
        <DataTable data={transactions} columns={columns} searchKey="description" />
      )}
    </div>
  )
}
