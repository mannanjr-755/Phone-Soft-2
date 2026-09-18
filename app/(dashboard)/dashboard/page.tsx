'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  DollarSign, TrendingDown, TrendingUp, HardHat,
  Activity, PauseCircle, Wrench, Handshake, Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { CashFlowChart, ExpenseBreakdownChart, UtilizationChart } from '@/components/dashboard/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/providers/toast-provider'
import type { ChartDataPoint, DashboardStats } from '@/types'

const EMPTY_STATS: DashboardStats = {
  totalRevenue: 0,
  totalExpenses: 0,
  totalProfit: 0,
  totalMachineryValue: 0,
  activeMachines: 0,
  idleMachines: 0,
  maintenanceMachines: 0,
  partnershipMachines: 0,
  revenueChange: 0,
  expensesChange: 0,
  profitChange: 0,
}

export default function DashboardPage() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [monthlyCashFlow, setMonthlyCashFlow] = useState<ChartDataPoint[]>([])
  const [expenseBreakdown, setExpenseBreakdown] = useState<ChartDataPoint[]>([])
  const [machineUtilization, setMachineUtilization] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load dashboard')
      setStats(data.stats)
      setMonthlyCashFlow(data.monthlyCashFlow)
      setExpenseBreakdown(data.expenseBreakdown)
      setMachineUtilization(data.machineUtilization)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load dashboard', 'error')
      setStats(EMPTY_STATS)
      setMonthlyCashFlow([])
      setExpenseBreakdown([])
      setMachineUtilization([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (pathname === '/dashboard') {
      fetchDashboard()
    }
  }, [pathname, fetchDashboard])

  useEffect(() => {
    const onFocus = () => fetchDashboard()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchDashboard])

  const profitMargin = stats.totalRevenue > 0
    ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of Cell Craft operations and financial performance"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue" value={stats.totalRevenue} change={stats.revenueChange} format="currency" icon={<DollarSign className="h-5 w-5" />} variant="success" />
        <StatCard title="Total Expenses" value={stats.totalExpenses} change={stats.expensesChange} format="currency" icon={<TrendingDown className="h-5 w-5" />} variant="danger" />
        <StatCard title="Total Profit" value={stats.totalProfit} change={stats.profitChange} format="currency" icon={<TrendingUp className="h-5 w-5" />} variant="success" />
        <StatCard title="Total Product Value" value={stats.totalMachineryValue} format="currency" icon={<HardHat className="h-5 w-5" />} variant="info" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Products" value={stats.activeMachines} format="number" icon={<Activity className="h-5 w-5 text-emerald-600" />} />
        <StatCard title="Idle Products" value={stats.idleMachines} format="number" icon={<PauseCircle className="h-5 w-5 text-amber-500" />} />
        <StatCard title="Under Maintenance" value={stats.maintenanceMachines} format="number" icon={<Wrench className="h-5 w-5 text-orange-500" />} />
        <StatCard title="Partnership Products" value={stats.partnershipMachines} format="number" icon={<Handshake className="h-5 w-5 text-blue-600" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CashFlowChart data={monthlyCashFlow} />
        <ExpenseBreakdownChart data={expenseBreakdown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <UtilizationChart data={machineUtilization} />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Profit & Loss Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Gross Revenue', value: stats.totalRevenue, color: 'text-emerald-600' },
                { label: 'Operating Expenses', value: stats.totalExpenses, color: 'text-red-500' },
                { label: 'Net Profit', value: stats.totalProfit, color: 'text-brand-900 dark:text-brand-600' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className={`font-semibold ${row.color}`}>{formatCurrency(row.value)}</span>
                </div>
              ))}
              <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-emerald-600">{profitMargin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
