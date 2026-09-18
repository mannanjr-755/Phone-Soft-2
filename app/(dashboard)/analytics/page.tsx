'use client'

import { PageHeader } from '@/components/dashboard/page-header'
import {
  RevenueExpensesChart, ProfitTrendChart, ExpenseBreakdownChart,
  UtilizationChart, PartnershipChart, CashFlowChart,
} from '@/components/dashboard/charts'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Interactive charts and business intelligence" />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueExpensesChart data={[]} />
        <ProfitTrendChart data={[]} />
        <CashFlowChart data={[]} />
        <ExpenseBreakdownChart data={[]} />
        <UtilizationChart data={[]} />
        <PartnershipChart data={[]} />
      </div>
    </div>
  )
}
