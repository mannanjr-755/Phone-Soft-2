'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/providers/toast-provider'
import { formatCurrency } from '@/lib/utils'
import { Landmark, Loader2 } from 'lucide-react'

type BankAccount = {
  id: string
  name: string
  bank: string
  number: string
  balance: number
}

export default function BankAccountsPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bank-accounts')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load bank accounts')
      setAccounts(data.accounts)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load bank accounts', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleDelete = async (account: BankAccount) => {
    setDeletingId(account.id)
    try {
      const res = await fetch(`/api/bank-accounts/${account.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete bank account')
      setAccounts((prev) => prev.filter((a) => a.id !== account.id))
      toast('Bank account removed')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete bank account', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bank Accounts" description="Manage company bank accounts" />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading bank accounts...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-brand-900" />
                  <CardTitle className="text-base">{a.name}</CardTitle>
                </div>
                <DeleteItemButton label={a.name} loading={deletingId === a.id} onDelete={() => handleDelete(a)} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{a.bank} — {a.number}</p>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(a.balance)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
