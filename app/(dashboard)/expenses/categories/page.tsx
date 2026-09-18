'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/providers/toast-provider'
import { formatCurrency } from '@/lib/utils'
import type { ExpenseCategoryRecord } from '@/lib/services/category-service'
import type { Expense } from '@/types'

type DialogMode = 'add' | 'edit' | null

export default function ExpenseCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<ExpenseCategoryRecord[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryRecord | null>(null)
  const [formLabel, setFormLabel] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formError, setFormError] = useState('')

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const [catRes, expRes] = await Promise.all([fetch('/api/categories'), fetch('/api/expenses')])
      const catData = await catRes.json()
      const expData = await expRes.json()
      if (!catRes.ok) throw new Error(catData.error ?? 'Failed to load categories')
      if (!expRes.ok) throw new Error(expData.error ?? 'Failed to load expenses')
      setCategories(catData.categories)
      setExpenses(expData.expenses)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openAddDialog = () => {
    setEditingCategory(null)
    setFormLabel('')
    setFormDescription('')
    setFormError('')
    setDialogMode('add')
  }

  const openEditDialog = (category: ExpenseCategoryRecord) => {
    setEditingCategory(category)
    setFormLabel(category.label)
    setFormDescription(category.description ?? '')
    setFormError('')
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setEditingCategory(null)
    setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formLabel.trim()) {
      setFormError('Category name is required')
      return
    }

    setSubmitting(true)
    setFormError('')

    try {
      if (dialogMode === 'add') {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: formLabel.trim(), description: formDescription.trim() || undefined }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to add category')
        setCategories((prev) => [...prev, data.category].sort((a, b) => a.label.localeCompare(b.label)))
        toast('Category added successfully')
      } else if (dialogMode === 'edit' && editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: formLabel.trim(), description: formDescription.trim() || undefined }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to update category')
        setCategories((prev) =>
          prev
            .map((c) => (c.id === editingCategory.id ? data.category : c))
            .sort((a, b) => a.label.localeCompare(b.label)),
        )
        toast('Category updated successfully')
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

  const handleDelete = async (category: ExpenseCategoryRecord) => {
    setDeletingId(category.id)
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete category')
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      toast('Category deleted successfully')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete category', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const getCategoryStats = (key: string) => {
    const items = expenses.filter((e) => e.category === key)
    return {
      total: items.reduce((s, e) => s + e.amount, 0),
      count: items.length,
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Expense Categories"
        description="Manage expense categories and view totals"
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No categories yet.</p>
            <Button className="mt-4" onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const stats = getCategoryStats(cat.key)
            return (
              <Card key={cat.id} className="hover:glow-border">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{cat.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{cat.key}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(cat)}
                      aria-label={`Edit ${cat.label}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteItemButton
                      label={cat.label}
                      loading={deletingId === cat.id}
                      onDelete={() => handleDelete(cat)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {cat.description && (
                    <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                  )}
                  <p className="text-2xl font-bold">{formatCurrency(stats.total)}</p>
                  <p className="text-xs text-muted-foreground">{stats.count} transactions</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'add' ? 'Add Category' : 'Edit Category'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'add'
                  ? 'Create a new expense category for your business.'
                  : 'Update category name and details.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {formError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="category-label">Category Name *</Label>
                <Input
                  id="category-label"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Inventory Restock Expenses"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description (optional)</Label>
                <Input
                  id="category-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description"
                />
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
                ) : dialogMode === 'add' ? (
                  'Add Category'
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
