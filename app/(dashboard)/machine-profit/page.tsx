'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, Loader2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/providers/toast-provider'
import { calculateProfitMargin } from '@/lib/sales/calculations'
import { formatCurrency, cn } from '@/lib/utils'
import { exportToExcel } from '@/lib/export'
import { ProfitTrendChart } from '@/components/dashboard/charts'
import type { SalesRecord } from '@/lib/services/sales-service'

type ProfitRow = SalesRecord & {
  totalExpenses: number
  profitMargin: number
  roi: number
}

function toProfitRow(sale: SalesRecord): ProfitRow {
  const totalExpenses = sale.purchaseCost + sale.machineCost
  const profitMargin = calculateProfitMargin(sale.sellingPrice, sale.profit)
  const roi = totalExpenses > 0 ? (sale.profit / totalExpenses) * 100 : 0
  return { ...sale, totalExpenses, profitMargin, roi }
}

export default function MachineProfitPage() {
  const { toast } = useToast()
  const [sales, setSales] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sales')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load profit data')
      setSales(data.sales)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load profit data', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const rows = useMemo(() => sales.map(toProfitRow), [sales])
  const sorted = useMemo(() => [...rows].sort((a, b) => b.profit - a.profit), [rows])
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  const handleDelete = async (row: ProfitRow) => {
    setDeletingId(row.id)
    try {
      const res = await fetch(`/api/sales/${row.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete record')
      setSales((prev) => prev.filter((s) => s.id !== row.id))
      toast('Sales record deleted successfully')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete record', 'error')
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
      render: (i: ProfitRow) => formatCurrency(i.purchaseCost),
    },
    {
      key: 'machineCost',
      header: 'Operating Cost',
      sortable: true,
      render: (i: ProfitRow) => formatCurrency(i.machineCost),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      sortable: true,
      render: (i: ProfitRow) => <span className="text-emerald-400">{formatCurrency(i.sellingPrice)}</span>,
    },
    {
      key: 'totalExpenses',
      header: 'Total Cost',
      sortable: true,
      render: (i: ProfitRow) => <span className="text-red-400">{formatCurrency(i.totalExpenses)}</span>,
    },
    {
      key: 'profit',
      header: 'Profit',
      sortable: true,
      render: (i: ProfitRow) => (
        <span className={cn('font-bold', i.profit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
          {formatCurrency(i.profit)}
        </span>
      ),
    },
    {
      key: 'profitMargin',
      header: 'Margin',
      sortable: true,
      render: (i: ProfitRow) => `${i.profitMargin.toFixed(1)}%`,
    },
    {
      key: 'roi',
      header: 'ROI',
      sortable: true,
      render: (i: ProfitRow) => `${i.roi.toFixed(1)}%`,
    },
    {
      key: 'actions',
      header: '',
      render: (i: ProfitRow) => (
        <DeleteItemButton
          label={i.itemName}
          loading={deletingId === i.id}
          onDelete={() => handleDelete(i)}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Product Profit Analysis"
        description="Profit = Selling Price − (Purchase Cost + Operating Cost)"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/sales"><Plus className="mr-2 h-4 w-4" /> Add Sales</Link>
            </Button>
            <Button variant="outline" onClick={() => exportToExcel(rows, 'product-profit-report')}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading profit data...
        </div>
      ) : (
        <>
          {best && worst && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm text-emerald-400">Best Performing</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-bold">{best.itemName}</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(best.profit)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm text-red-400">Least Profitable</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-bold">{worst.itemName}</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(worst.profit)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <ProfitTrendChart data={[]} />
          <DataTable
            data={rows}
            columns={columns}
            searchKey="itemName"
            searchPlaceholder="Search sales records..."
            emptyMessage="No sales records yet. Add sales to see profit analysis."
          />
        </>
      )}
    </div>
  )
}
