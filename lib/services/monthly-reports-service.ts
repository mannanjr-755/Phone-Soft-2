import type { ChartDataPoint } from '@/types'
import { getHiddenMonthKeys, hideMonthKey } from '@/lib/db/monthly-report-exclusions'
import { toNumber } from '@/lib/db/serialize'
import { EXPENSE_CATEGORIES, shortCategoryName } from '@/lib/data/mock-data'
import { prisma } from '@/lib/prisma'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function monthKeyFromDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
}

export interface MonthlyReportRow {
  monthKey: string
  name: string
  revenue: number
  expenses: number
  profit: number
}

export interface MonthlyReportsData {
  rows: MonthlyReportRow[]
  expenseBreakdown: ChartDataPoint[]
}

async function loadFinancialRecords() {
  const [sales, expenses, transactions] = await Promise.all([
    prisma.sale.findMany(),
    prisma.expense.findMany(),
    prisma.transaction.findMany(),
  ])
  return { sales, expenses, transactions }
}

function buildMonthlyRows(
  sales: Awaited<ReturnType<typeof loadFinancialRecords>>['sales'],
  expenses: Awaited<ReturnType<typeof loadFinancialRecords>>['expenses'],
  transactions: Awaited<ReturnType<typeof loadFinancialRecords>>['transactions'],
): MonthlyReportRow[] {
  const now = new Date()
  const rows: MonthlyReportRow[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKeyFromDate(d)
    let revenue = 0
    let monthExpenses = 0

    for (const sale of sales) {
      if (monthKeyFromDate(sale.createdAt) === key) revenue += toNumber(sale.sellingPrice)
    }
    for (const tx of transactions) {
      if (monthKeyFromDate(tx.date) !== key) continue
      if (tx.type === 'INCOME') revenue += toNumber(tx.amount)
      else monthExpenses += toNumber(tx.amount)
    }
    for (const expense of expenses) {
      if (monthKeyFromDate(expense.date) === key) monthExpenses += toNumber(expense.amount)
    }

    rows.push({
      monthKey: key,
      name: MONTH_LABELS[d.getMonth()],
      revenue,
      expenses: monthExpenses,
      profit: revenue - monthExpenses,
    })
  }

  return rows
}

function buildExpenseBreakdown(
  expenses: Awaited<ReturnType<typeof loadFinancialRecords>>['expenses'],
): ChartDataPoint[] {
  const categoryTotals = new Map<string, number>()
  for (const expense of expenses) {
    const cat = expense.category
    categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + toNumber(expense.amount))
  }

  return EXPENSE_CATEGORIES.map((cat) => ({
    name: shortCategoryName(cat.label),
    value: categoryTotals.get(cat.key) ?? 0,
  })).filter((row) => (row.value ?? 0) > 0)
}

export const monthlyReportsService = {
  async getReports(): Promise<MonthlyReportsData> {
    const [{ sales, expenses, transactions }, hiddenKeys] = await Promise.all([
      loadFinancialRecords(),
      getHiddenMonthKeys(),
    ])

    const rows = buildMonthlyRows(sales, expenses, transactions).filter((row) => !hiddenKeys.has(row.monthKey))

    return {
      rows,
      expenseBreakdown: buildExpenseBreakdown(expenses),
    }
  },

  async hideMonth(monthKey: string): Promise<void> {
    await hideMonthKey(monthKey)
  },
}
