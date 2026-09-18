'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingDown, TrendingUp, Landmark, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import type { FinancialOverview } from '@/lib/services/financial-overview-service'

const EMPTY_OVERVIEW: FinancialOverview = {
  totalIncome: 0,
  totalExpenses: 0,
  netProfit: 0,
  cashBalance: 0,
  receivablesTotal: 0,
  receivablesCount: 0,
  payablesTotal: 0,
  payablesCount: 0,
}

export default function FinancialPage() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [overview, setOverview] = useState<FinancialOverview>(EMPTY_OVERVIEW)
  const [loading, setLoading] = useState(true)

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/financial/overview', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load financial overview')
      setOverview(data.overview)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load financial overview', 'error')
      setOverview(EMPTY_OVERVIEW)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (pathname === '/financial') {
      fetchOverview()
    }
  }, [pathname, fetchOverview])

  useEffect(() => {
    const onFocus = () => fetchOverview()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchOverview])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading financial overview...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Overview" description="Income, expenses, and financial health" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Income" value={overview.totalIncome} format="currency" icon={<DollarSign className="h-5 w-5 text-emerald-600" />} variant="success" />
        <StatCard title="Total Expenses" value={overview.totalExpenses} format="currency" icon={<TrendingDown className="h-5 w-5 text-red-500" />} variant="danger" />
        <StatCard title="Net Profit" value={overview.netProfit} format="currency" icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} variant="success" />
        <StatCard title="Cash Balance" value={overview.cashBalance} format="currency" icon={<Landmark className="h-5 w-5 text-brand-900" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Transactions', href: '/financial/transactions', desc: 'All financial transactions' },
          { title: 'Bank Accounts', href: '/financial/bank-accounts', desc: 'Manage bank accounts' },
          { title: 'Accounts Receivable', href: '/financial/receivables', desc: 'Outstanding receivables' },
          { title: 'Accounts Payable', href: '/financial/payables', desc: 'Outstanding payables' },
          { title: 'Balance Sheet', href: '/financial', desc: 'Assets, liabilities, equity' },
          { title: 'Cash Flow', href: '/financial', desc: 'Cash flow statement' },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader><CardTitle className="text-base">{item.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">{item.desc}</p>
              <Link href={item.href}><Button variant="outline" size="sm">View</Button></Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">Accounts Receivable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(overview.receivablesTotal)}</p>
            <p className="text-sm text-muted-foreground">
              {overview.receivablesCount} pending invoice{overview.receivablesCount === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-red-500" />
            <CardTitle className="text-base">Accounts Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(overview.payablesTotal)}</p>
            <p className="text-sm text-muted-foreground">
              {overview.payablesCount} pending bill{overview.payablesCount === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
