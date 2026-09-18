'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CreditCard, Loader2, Pencil, Plus, Search, Users, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
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
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { CreditRecordDto } from '@/lib/services/credit-service'

type DialogMode = 'add' | 'edit' | null

type CustomerOption = { id: string; name: string; phone: string }
type ProductOption = { id: string; name: string; stock: number }

const today = () => new Date().toISOString().split('T')[0]

const emptyForm = () => ({
  fromDate: today(),
  tillDate: today(),
  customerName: '',
  mobileName: '',
  totalAmount: '',
  paidAmount: '0',
  notes: '',
})

export default function CreditPage() {
  const { toast } = useToast()
  const [credits, setCredits] = useState<CreditRecordDto[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editing, setEditing] = useState<CreditRecordDto | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTill, setFilterTill] = useState('')

  const fetchCredits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/credits', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load credit records')
      setCredits(data.credits ?? [])
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load credit records', 'error')
      setCredits([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadOptions = useCallback(async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        fetch('/api/customers', { cache: 'no-store' }),
        fetch('/api/products', { cache: 'no-store' }),
      ])
      const customersData = await customersRes.json()
      const productsData = await productsRes.json()
      if (customersRes.ok) setCustomers(customersData.customers ?? [])
      if (productsRes.ok) setProducts(productsData.products ?? [])
    } catch {
      /* keep existing options */
    }
  }, [])

  useEffect(() => {
    fetchCredits()
    loadOptions()
  }, [fetchCredits, loadOptions])

  const remainingPreview = useMemo(() => {
    const total = Number(form.totalAmount)
    const paid = Number(form.paidAmount || 0)
    if (Number.isNaN(total) || Number.isNaN(paid)) return null
    return Math.round((total - paid) * 100) / 100
  }, [form.totalAmount, form.paidAmount])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return credits.filter((c) => {
      const matchesSearch =
        !q ||
        c.customerName.toLowerCase().includes(q) ||
        c.mobileName.toLowerCase().includes(q)
      const matchesFrom = !filterFrom || c.fromDate >= filterFrom
      const matchesTill = !filterTill || c.tillDate <= filterTill
      return matchesSearch && matchesFrom && matchesTill
    })
  }, [credits, search, filterFrom, filterTill])

  const summary = useMemo(() => {
    const totalCredit = filtered.reduce((sum, c) => sum + c.totalAmount, 0)
    const totalPaid = filtered.reduce((sum, c) => sum + c.paidAmount, 0)
    const totalRemaining = filtered.reduce((sum, c) => sum + c.remainingAmount, 0)
    const uniqueCustomers = new Set(filtered.map((c) => c.customerName.trim().toLowerCase())).size
    return { totalCredit, totalPaid, totalRemaining, uniqueCustomers }
  }, [filtered])

  const openAddDialog = async () => {
    await loadOptions()
    setEditing(null)
    setForm(emptyForm())
    setFormError('')
    setDialogMode('add')
  }

  const openEditDialog = async (record: CreditRecordDto) => {
    await loadOptions()
    setEditing(record)
    setForm({
      fromDate: record.fromDate,
      tillDate: record.tillDate,
      customerName: record.customerName,
      mobileName: record.mobileName,
      totalAmount: String(record.totalAmount),
      paidAmount: String(record.paidAmount),
      notes: record.notes ?? '',
    })
    setFormError('')
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setEditing(null)
    setFormError('')
  }

  const validateForm = (): string | null => {
    if (!form.fromDate) return 'From date is required'
    if (!form.tillDate) return 'Till date is required'
    if (form.tillDate < form.fromDate) return 'Till date must be on or after from date'
    if (!form.customerName.trim()) return 'Please select a customer'
    if (!form.mobileName.trim()) return 'Please select a mobile'
    const total = Number(form.totalAmount)
    const paid = Number(form.paidAmount || 0)
    if (form.totalAmount === '' || Number.isNaN(total) || total < 0) {
      return 'Total amount must be a valid non-negative number'
    }
    if (Number.isNaN(paid) || paid < 0) {
      return 'Paid amount must be a valid non-negative number'
    }
    if (paid > total) return 'Paid amount cannot exceed total amount'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSubmitting(true)
    setFormError('')

    const payload = {
      fromDate: form.fromDate,
      tillDate: form.tillDate,
      customerName: form.customerName.trim(),
      mobileName: form.mobileName.trim(),
      totalAmount: Number(form.totalAmount),
      paidAmount: Number(form.paidAmount || 0),
      notes: form.notes.trim() || null,
    }

    try {
      const res = await fetch(editing ? `/api/credits/${editing.id}` : '/api/credits', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save credit record')
      toast(editing ? 'Credit record updated' : 'Credit record added')
      closeDialog()
      await fetchCredits()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      setFormError(message)
      toast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (record: CreditRecordDto) => {
    setDeletingId(record.id)
    try {
      const res = await fetch(`/api/credits/${record.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Failed to delete credit record')
      toast('Credit record deleted')
      await fetchCredits()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete credit record', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const customerOptions = useMemo(() => {
    const names = customers.map((c) => c.name)
    if (form.customerName && !names.includes(form.customerName)) {
      return [...customers, { id: `existing-${form.customerName}`, name: form.customerName, phone: '' }]
    }
    return customers
  }, [customers, form.customerName])

  const productOptions = useMemo(() => {
    const names = products.map((p) => p.name)
    if (form.mobileName && !names.includes(form.mobileName)) {
      return [...products, { id: `existing-${form.mobileName}`, name: form.mobileName, stock: 0 }]
    }
    return products
  }, [products, form.mobileName])

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Credit / Udhaar"
        description="Track phones given on credit and remaining customer balances"
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Credit Record
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Credit Given" value={summary.totalCredit} format="currency" icon={<CreditCard className="h-5 w-5" />} variant="info" />
        <StatCard title="Total Paid" value={summary.totalPaid} format="currency" icon={<Wallet className="h-5 w-5" />} variant="success" />
        <StatCard title="Total Remaining" value={summary.totalRemaining} format="currency" icon={<CreditCard className="h-5 w-5" />} variant="danger" />
        <StatCard title="Number of Credit Customers" value={summary.uniqueCustomers} format="number" icon={<Users className="h-5 w-5" />} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by customer or mobile name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filterFrom" className="text-xs text-muted-foreground">From date</Label>
              <Input id="filterFrom" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filterTill" className="text-xs text-muted-foreground">Till date</Label>
              <Input id="filterTill" type="date" value={filterTill} onChange={(e) => setFilterTill(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading credit records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-12 text-center">
              <p className="font-medium">No credit records found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {credits.length === 0
                  ? 'Add your first credit / udhaar record to get started.'
                  : 'Try adjusting your search or date filters.'}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] table-auto text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-3 font-medium">From</th>
                      <th className="pb-3 pr-3 font-medium">Till</th>
                      <th className="pb-3 pr-3 font-medium">Customer</th>
                      <th className="pb-3 pr-3 font-medium">Mobile</th>
                      <th className="pb-3 pr-3 font-medium">Total</th>
                      <th className="pb-3 pr-3 font-medium">Paid</th>
                      <th className="pb-3 pr-3 font-medium">Remaining</th>
                      <th className="pb-3 pr-3 font-medium">Notes</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record) => (
                      <tr key={record.id} className="border-b last:border-0">
                        <td className="py-3 pr-3 whitespace-nowrap">{formatDate(record.fromDate)}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">{formatDate(record.tillDate)}</td>
                        <td className="py-3 pr-3 font-medium">{record.customerName}</td>
                        <td className="py-3 pr-3">{record.mobileName}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">{formatCurrency(record.totalAmount)}</td>
                        <td className="py-3 pr-3 whitespace-nowrap text-emerald-500">{formatCurrency(record.paidAmount)}</td>
                        <td className={cn('py-3 pr-3 whitespace-nowrap font-semibold', record.remainingAmount > 0 ? 'text-rose-500' : 'text-emerald-500')}>
                          {formatCurrency(record.remainingAmount)}
                        </td>
                        <td className="py-3 pr-3 max-w-[180px] truncate text-muted-foreground">{record.notes || '—'}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(record)} aria-label={`Edit ${record.customerName}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <DeleteItemButton
                              label={`${record.customerName} — ${record.mobileName}`}
                              loading={deletingId === record.id}
                              onDelete={() => handleDelete(record)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 md:hidden">
                {filtered.map((record) => (
                  <div key={record.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{record.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(record.fromDate)} → {formatDate(record.tillDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(record)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteItemButton
                          label={`${record.customerName} — ${record.mobileName}`}
                          loading={deletingId === record.id}
                          onDelete={() => handleDelete(record)}
                        />
                      </div>
                    </div>
                    <p className="text-sm">{record.mobileName}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">{formatCurrency(record.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid</p>
                        <p className="font-medium text-emerald-500">{formatCurrency(record.paidAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className={cn('font-semibold', record.remainingAmount > 0 ? 'text-rose-500' : 'text-emerald-500')}>
                          {formatCurrency(record.remainingAmount)}
                        </p>
                      </div>
                    </div>
                    {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'add' ? 'Add Credit Record' : 'Edit Credit Record'}</DialogTitle>
              <DialogDescription>
                Select customer and mobile from your records. Remaining = Total − Paid.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label>Customer Name *</Label>
                {customerOptions.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                    No customers found. Add a customer in Customers first.
                  </p>
                ) : (
                  <Select
                    value={form.customerName}
                    onValueChange={(value) => setForm((f) => ({ ...f, customerName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerOptions.map((customer) => (
                        <SelectItem key={customer.id} value={customer.name}>
                          {customer.name}{customer.phone ? ` (${customer.phone})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Mobile Name *</Label>
                {productOptions.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                    No mobiles found. Add a product in Stock first.
                  </p>
                ) : (
                  <Select
                    value={form.mobileName}
                    onValueChange={(value) => setForm((f) => ({ ...f, mobileName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mobile" />
                    </SelectTrigger>
                    <SelectContent>
                      {productOptions.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}{typeof product.stock === 'number' ? ` (Stock: ${product.stock})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fromDate">From Date *</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={form.fromDate}
                    onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tillDate">Till Date *</Label>
                  <Input
                    id="tillDate"
                    type="date"
                    value={form.tillDate}
                    onChange={(e) => setForm((f) => ({ ...f, tillDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.totalAmount}
                    onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Paid Amount</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.paidAmount}
                    onChange={(e) => setForm((f) => ({ ...f, paidAmount: e.target.value }))}
                  />
                </div>
              </div>

              {remainingPreview !== null && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <span className="text-muted-foreground">Remaining Amount: </span>
                  <span className={cn('font-bold', remainingPreview > 0 ? 'text-rose-500' : 'text-emerald-500')}>
                    {formatCurrency(remainingPreview)}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || customerOptions.length === 0 || productOptions.length === 0}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : dialogMode === 'add' ? (
                  'Add Credit Record'
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
