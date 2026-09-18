'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { ExpenseBreakdownChart } from '@/components/dashboard/charts'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { exportToExcel } from '@/lib/export'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { ChartDataPoint } from '@/types'
import type { MonthlyReportRow } from '@/lib/services/monthly-reports-service'

export default function ExpenseReportsPage() {
  const { toast } = useToast()
  const [monthlyRows, setMonthlyRows] = useState<MonthlyReportRow[]>([])
  const [expenseBreakdown, setExpenseBreakdown] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/expenses/reports', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load reports')
      setMonthlyRows(data.rows)
      setExpenseBreakdown(data.expenseBreakdown)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load reports', 'error')
      setMonthlyRows([])
      setExpenseBreakdown([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleDelete = async (row: MonthlyReportRow) => {
    setDeletingKey(row.monthKey)
    try {
      const res = await fetch(`/api/expenses/reports/${encodeURIComponent(row.monthKey)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to remove report')
      setMonthlyRows((prev) => prev.filter((m) => m.monthKey !== row.monthKey))
      toast(`Removed ${row.name} from report`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to remove report', 'error')
    } finally {
      setDeletingKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Expense Reports"
        description="Detailed monthly expense analysis and trends"
        actions={
          <Button variant="outline" onClick={() => exportToExcel(monthlyRows, 'monthly-expense-report')}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading reports...
        </div>
      ) : (
        <>
          <ExpenseBreakdownChart
            data={expenseBreakdown.length > 0 ? expenseBreakdown : [{ name: 'No data', value: 0 }]}
          />
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Summary</CardTitle></CardHeader>
            <CardContent>
              {monthlyRows.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No monthly reports to display.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Month</th>
                        <th className="py-2 text-right">Expenses</th>
                        <th className="py-2 text-right">Revenue</th>
                        <th className="py-2 text-right">Net</th>
                        <th className="py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRows.map((m) => (
                        <tr key={m.monthKey} className="border-b">
                          <td className="py-2">{m.name}</td>
                          <td className="py-2 text-right text-red-500">{formatCurrency(m.expenses)}</td>
                          <td className="py-2 text-right text-emerald-600">{formatCurrency(m.revenue)}</td>
                          <td className="py-2 text-right font-medium">{formatCurrency(m.profit)}</td>
                          <td className="py-2 text-right">
                            <DeleteItemButton
                              label={m.name}
                              loading={deletingKey === m.monthKey}
                              onDelete={() => handleDelete(m)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
