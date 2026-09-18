'use client'

import { useCallback, useEffect, useState } from 'react'
import { Printer } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { PurchaseReceiptModal, type PurchaseRecord } from '@/components/dashboard/purchase-receipt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

type PurchaseItem = {
  id: string
  name: string
  qty: number
  price: number
  createdAt?: string
}

export default function PurchasesPage() {
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<PurchaseItem | null>(null)
  const [form, setForm] = useState({ name: '', qty: '', price: '' })
  const [receiptPurchase, setReceiptPurchase] = useState<PurchaseRecord | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/purchases')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load purchases')
      setItems(data.purchases ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load purchases')
    } finally {
      setLoading(false)
      setReady(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const startAdd = () => { setEditing(null); setForm({ name: '', qty: '', price: '' }) }
  const startEdit = (it: PurchaseItem) => { setEditing(it); setForm({ name: it.name, qty: String(it.qty), price: String(it.price) }) }

  const save = async () => {
    setError('')
    if (!form.name.trim()) { setError('Name is required'); return }
    try {
      const body = { name: form.name.trim(), qty: Number(form.qty), price: Number(form.price) }
      const res = await fetch(editing ? `/api/purchases/${editing.id}` : '/api/purchases', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save purchase')
      await load()
      setForm({ name: '', qty: '', price: '' })
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save purchase')
    }
  }

  const del = async (id: string) => {
    setError('')
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to delete purchase')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete purchase')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Purchases" description="Manage incoming stock for phones & accessories" />

      <Card>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Button onClick={startAdd}>Add Purchase</Button>
          </div>

          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Quantity" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} />
            <Input placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div className="mb-6 flex gap-2">
            <Button onClick={save}>{editing ? 'Update' : 'Create'}</Button>
            {editing && <Button variant="outline" onClick={startAdd}>Cancel</Button>}
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {!ready ? null : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-sm text-muted-foreground">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-sm text-muted-foreground">No purchases yet. Add your first purchase above.</td></tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-2">{row.name}</td>
                      <td>{row.qty}</td>
                      <td>{row.price}</td>
                      <td className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(row)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => setReceiptPurchase(row)}>
                          <Printer className="h-4 w-4" /> Print Receipt
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => del(row.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {receiptPurchase && (
        <PurchaseReceiptModal
          purchase={receiptPurchase}
          onClose={() => setReceiptPurchase(null)}
        />
      )}
    </div>
  )
}
