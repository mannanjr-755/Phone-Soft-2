'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { EXPENSE_CATEGORIES, shortCategoryName } from '@/lib/data/mock-data'
import { useToast } from '@/components/providers/toast-provider'
import { formatCurrency, formatDate } from '@/lib/utils'
import { exportToExcel } from '@/lib/export'
import type { Expense, ExpenseCategory } from '@/types'

export default function ExpensesPage() {
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory>('ALL_PRODUCTS')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/expenses', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load expenses')
      setExpenses(data.expenses)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load expenses', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const openAddDialog = () => {
    setCategory('ALL_PRODUCTS')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setFormError('')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setFormError('Description is required')
      return
    }
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setFormError('Amount must be greater than 0')
      return
    }
    if (!date) {
      setFormError('Date is required')
      return
    }

    setSubmitting(true)
    setFormError('')

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: parsedAmount,
          date,
          description: description.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add expense')
      setExpenses((prev) => [data.expense, ...prev])
      toast('Expense added successfully')
      closeDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      setFormError(message)
      toast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item: Expense) => {
    setDeletingId(item.id)
    try {
      const res = await fetch(`/api/expenses/${item.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete expense')
      await fetchExpenses()
      toast('Expense deleted')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete expense', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    { key: 'date', header: 'Date', sortable: true, render: (item: Expense) => formatDate(item.date) },
    { key: 'category', header: 'Category', sortable: true, render: (item: Expense) => (
      <Badge variant="outline" className="font-normal">{EXPENSE_CATEGORIES.find((c) => c.key === item.category)?.label ?? item.category.replace(/_/g, ' ')}</Badge>
    )},
    { key: 'description', header: 'Description', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, render: (item: Expense) => (
      <span className="font-medium text-red-400">{formatCurrency(item.amount)}</span>
    )},
    {
      key: 'actions',
      header: '',
      render: (item: Expense) => (
        <DeleteItemButton label={item.description} loading={deletingId === item.id} onDelete={() => handleDelete(item)} />
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Expenses"
        description="Track and manage all business expenses across categories"
        actions={
          <>
            <Button variant="outline" onClick={() => exportToExcel(expenses, 'expenses-report')}>
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading expenses...
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Expenses</TabsTrigger>
            {EXPENSE_CATEGORIES.slice(0, 5).map((cat) => (
              <TabsTrigger key={cat.key} value={cat.key}>{shortCategoryName(cat.label)}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all">
            <DataTable data={expenses} columns={columns} searchKey="description" searchPlaceholder="Search expenses..." emptyMessage="No expenses yet. Click Add Expense to create one." />
          </TabsContent>
          {EXPENSE_CATEGORIES.slice(0, 5).map((cat) => (
            <TabsContent key={cat.key} value={cat.key}>
              <DataTable
                data={expenses.filter((e) => e.category === cat.key)}
                columns={columns}
                searchKey="description"
                emptyMessage={`No ${cat.label.toLowerCase()} found`}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Record a new business expense. It will be saved permanently.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger id="expense-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.key} value={cat.key}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description *</Label>
                <Input
                  id="expense-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Mobile accessories restock"
                  autoFocus
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount (PKR) *</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-date">Date *</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Expense'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
