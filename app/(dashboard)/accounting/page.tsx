'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AccountingEntry = {
  id: string
  desc: string
  amount: number
}

export default function AccountingPage() {
  const [entries, setEntries] = useState<AccountingEntry[]>([])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [editing, setEditing] = useState<AccountingEntry | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/accounting')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load entries')
      setEntries(data.entries ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load entries')
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
    if (!desc.trim()) { setError('Description is required'); return }
    try {
      const res = await fetch(editing ? `/api/accounting/${editing.id}` : '/api/accounting', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desc: desc.trim(), amount: Number(amount) || 0 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save entry')
      await load()
      setDesc('')
      setAmount('')
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save entry')
    }
  }

  const del = async (id: string) => {
    setError('')
    try {
      const res = await fetch(`/api/accounting/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to delete entry')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete entry')
    }
  }

  const edit = (r: AccountingEntry) => {
    setEditing(r)
    setDesc(r.desc)
    setAmount(String(r.amount))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Accounting" description="Simple accounting entries for phone sales and purchases" />
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex gap-2">
            <Input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Input placeholder="Amount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button onClick={save}>{editing ? 'Update' : 'Add'}</Button>
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {!ready ? null : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && entries.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-sm text-muted-foreground">Loading...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-sm text-muted-foreground">No entries yet. Add your first entry above.</td></tr>
                ) : (
                  entries.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.desc}</td>
                      <td>{r.amount}</td>
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
