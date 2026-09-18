'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type CashBankAccount = {
  id: string
  name: string
  balance: number
}

export default function CashBankPage() {
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [editing, setEditing] = useState<CashBankAccount | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cash-bank')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load accounts')
      setAccounts(data.accounts ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
      setReady(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setError('')
    if (!name.trim()) { setError('Account name is required'); return }
    try {
      const res = await fetch(editing ? `/api/cash-bank/${editing.id}` : '/api/cash-bank', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), balance: Number(balance) || 0 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save account')
      await load()
      setName('')
      setBalance('')
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save account')
    }
  }

  const del = async (id: string) => {
    setError('')
    try {
      const res = await fetch(`/api/cash-bank/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to delete account')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete account')
    }
  }

  const edit = (r: CashBankAccount) => {
    setEditing(r)
    setName(r.name)
    setBalance(String(r.balance))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cash & Bank" description="Manage cash registers and bank accounts" />
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex gap-2">
            <Input placeholder="Account name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Balance" type="number" min="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
            <Button onClick={save}>{editing ? 'Update' : 'Add'}</Button>
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {!ready ? null : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th>Name</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && accounts.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-sm text-muted-foreground">Loading...</td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-sm text-muted-foreground">No accounts yet. Add your first account above.</td></tr>
                ) : (
                  accounts.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.name}</td>
                      <td>{r.balance}</td>
                      <td className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => edit(r)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => del(r.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
