'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Plus, Save } from 'lucide-react'

type ProductItem = {
  id: string
  name: string
  stock: number
}

export default function InventoryPage() {
  const [items, setItems] = useState<ProductItem[]>([])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<ProductItem | null>(null)
  const [name, setName] = useState('')
  const [stock, setStock] = useState('')
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load products')
      setItems(data.products ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
      setReady(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalStock = useMemo(() => items.reduce((sum, item) => sum + item.stock, 0), [items])
  const lowStockItems = useMemo(() => items.filter((item) => item.stock < 10).length, [items])

  const save = async () => {
    if (!name.trim()) {
      setFormError('Product name is required')
      return
    }
    if (!stock || Number(stock) < 0) {
      setFormError('Please enter a valid stock quantity')
      return
    }

    setFormError('')
    setError('')
    try {
      const res = await fetch(editing ? `/api/products/${editing.id}` : '/api/products', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), stock: Number(stock) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save product')
      await load()
      setName('')
      setStock('')
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save product')
    }
  }

  const del = async (id: string) => {
    setError('')
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to delete product')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete product')
    }
  }

  const edit = (row: ProductItem) => {
    setEditing(row)
    setName(row.name)
    setStock(String(row.stock))
    setFormError('')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Stock" description="Manage stock for mobile phones and accessories" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Stock Units</p>
            <p className="text-2xl font-bold">{totalStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <p className="text-2xl font-bold text-amber-500">{lowStockItems}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="item-name">Product name</Label>
              <Input id="item-name" placeholder="e.g. iPhone 15 Pro" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-stock">Stock quantity</Label>
              <Input id="item-stock" type="number" min="0" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <Button onClick={save}>
              {editing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {editing ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
          {formError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {!ready ? null : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-sm text-muted-foreground">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-sm text-muted-foreground">No products yet. Add your first product above.</td></tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td className={r.stock < 10 ? 'font-semibold text-amber-500' : ''}>{r.stock}</td>
                      <td className="space-x-2 text-right">
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
