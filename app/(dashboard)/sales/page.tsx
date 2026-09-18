'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/providers/toast-provider'
import { calculateSalesProfit } from '@/lib/sales/calculations'
import { formatCurrency, cn } from '@/lib/utils'
import type { SalesRecord } from '@/lib/services/sales-service'

type DialogMode = 'add' | 'edit' | null

type ProductOption = {
  id: string
  name: string
  stock: number
}

export default function SalesPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<ProductOption[]>([])
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [itemName, setItemName] = useState('')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [machineCost, setMachineCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [formError, setFormError] = useState('')

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sales', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load sales')
      setSales(data.sales)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load sales', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load products')
      setProducts(data.products ?? [])
      return data.products ?? []
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load products', 'error')
      return []
    }
  }, [toast])

  useEffect(() => {
    fetchSales()
    loadProducts()
  }, [fetchSales, loadProducts])

  const availableProducts = useMemo(
    () => products.filter((product) => product.stock > 0),
    [products],
  )

  const applyProductSelection = (productId: string) => {
    const product = products.find((item) => item.id === productId)
    if (!product) return
    setSelectedProductId(productId)
    setItemName(product.name)
  }

  const openAddDialog = () => {
    loadProducts()
    setEditingSale(null)
    setSelectedProductId('')
    setItemName('')
    setPurchaseCost('')
    setMachineCost('')
    setSellingPrice('')
    setFormError('')
    setDialogMode('add')
  }

  const openEditDialog = async (sale: SalesRecord) => {
    const list = await loadProducts()
    setEditingSale(sale)
    const matched = list.find((item: ProductOption) => item.name === sale.itemName)
    setSelectedProductId(matched?.id ?? '')
    setItemName(sale.itemName)
    setPurchaseCost(String(sale.purchaseCost))
    setMachineCost(String(sale.machineCost))
    setSellingPrice(String(sale.sellingPrice))
    setFormError('')
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setEditingSale(null)
    setSelectedProductId('')
    setFormError('')
  }

  const previewProfit = useMemo(() => {
    const sell = parseFloat(sellingPrice) || 0
    const purchase = parseFloat(purchaseCost) || 0
    const machine = parseFloat(machineCost) || 0
    if (!itemName.trim() && sell === 0) return null
    return calculateSalesProfit(sell, purchase, machine)
  }, [sellingPrice, purchaseCost, machineCost, itemName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId && !itemName.trim()) {
      setFormError('Please select a product from Stock')
      return
    }
    if (!itemName.trim()) {
      setFormError('Product/Item name is required')
      return
    }

    const payload = {
      itemName: itemName.trim(),
      purchaseCost: parseFloat(purchaseCost) || 0,
      machineCost: parseFloat(machineCost) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
    }

    setSubmitting(true)
    setFormError('')

    try {
      if (dialogMode === 'add') {
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to add sale')
        setSales((prev) => [data.sale, ...prev])
        toast('Sale added successfully')
      } else if (dialogMode === 'edit' && editingSale) {
        const res = await fetch(`/api/sales/${editingSale.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to update sale')
        setSales((prev) => prev.map((s) => (s.id === editingSale.id ? data.sale : s)))
        toast('Sale updated successfully')
      }
      closeDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      setFormError(message)
      toast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (sale: SalesRecord) => {
    setDeletingId(sale.id)
    try {
      const res = await fetch(`/api/sales/${sale.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete sale')
      await fetchSales()
      toast('Sale deleted successfully')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete sale', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'itemName', header: 'Product / Item', sortable: true },
    {
      key: 'purchaseCost',
      header: 'Purchase Cost',
      sortable: true,
      render: (s: SalesRecord) => formatCurrency(s.purchaseCost),
    },
    {
      key: 'machineCost',
      header: 'Operating Cost',
      sortable: true,
      render: (s: SalesRecord) => formatCurrency(s.machineCost),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      sortable: true,
      render: (s: SalesRecord) => formatCurrency(s.sellingPrice),
    },
    {
      key: 'profit',
      header: 'Profit',
      sortable: true,
      render: (s: SalesRecord) => (
        <span className={cn('font-bold', s.profit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
          {formatCurrency(s.profit)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (s: SalesRecord) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(s)} aria-label={`Edit ${s.itemName}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteItemButton
            label={s.itemName}
            loading={deletingId === s.id}
            onDelete={() => handleDelete(s)}
          />
        </div>
      ),
    },
  ]

  const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0)

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Sales"
        description="Track sales, product costs, and profit per item"
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Product Sale
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Sales Records</p><p className="text-2xl font-bold">{sales.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Profit</p><p className={cn('text-2xl font-bold', totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{formatCurrency(totalProfit)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Formula</p><p className="text-sm font-medium mt-1">Profit = Selling Price − (Purchase + Operating Cost)</p></CardContent></Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading sales...
        </div>
      ) : (
        <DataTable data={sales} columns={columns} searchKey="itemName" searchPlaceholder="Search product sales..." emptyMessage="No sales records yet. Click Add Product Sale to create one." />
      )}

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'add' ? 'Add Product Sale' : 'Edit Product Sale'}</DialogTitle>
              <DialogDescription>
                Profit is calculated automatically: Selling Price − (Purchase Cost + Operating Cost)
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="itemName">Product / Item Name *</Label>
                {availableProducts.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                    No products available. Add a product in Stock first.
                  </p>
                ) : (
                  <Select
                    value={selectedProductId}
                    onValueChange={applyProductSelection}
                  >
                    <SelectTrigger id="itemName">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {itemName && (
                  <p className="text-xs text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{itemName}</span>
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="purchaseCost">Purchase Cost (PKR)</Label>
                  <Input id="purchaseCost" type="number" min="0" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machineCost">Operating Cost (PKR)</Label>
                  <Input id="machineCost" type="number" min="0" value={machineCost} onChange={(e) => setMachineCost(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (PKR)</Label>
                  <Input id="sellingPrice" type="number" min="0" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
                </div>
              </div>
              {previewProfit !== null && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <span className="text-muted-foreground">Calculated Profit: </span>
                  <span className={cn('font-bold', previewProfit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                    {formatCurrency(previewProfit)}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : dialogMode === 'add' ? 'Add Product Sale' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
