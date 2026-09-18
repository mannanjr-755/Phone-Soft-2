import type { ChartDataPoint, DashboardStats } from '@/types'
import { toNumber } from '@/lib/db/serialize'
import { EXPENSE_CATEGORIES, shortCategoryName } from '@/lib/data/mock-data'
import { prisma } from '@/lib/prisma'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const STATUS_UTILIZATION: Record<string, number> = {
  ACTIVE: 85,
  IDLE: 25,
  MAINTENANCE: 40,
  PARTNERSHIP: 75,
  RETIRED: 10,
  SOLD: 0,
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

export interface DashboardData {
  stats: DashboardStats
  monthlyCashFlow: ChartDataPoint[]
  expenseBreakdown: ChartDataPoint[]
  machineUtilization: ChartDataPoint[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const [sales, expenses, transactions, machines] = await Promise.all([
    prisma.sale.findMany(),
    prisma.expense.findMany(),
    prisma.transaction.findMany(),
    prisma.machine.findMany(),
  ])

  const salesRevenue = sales.reduce((sum, s) => sum + toNumber(s.sellingPrice), 0)
  const transactionIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + toNumber(t.amount), 0)
  const totalRevenue = salesRevenue + transactionIncome

  const expenseTotal = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0)
  const transactionExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + toNumber(t.amount), 0)
  const totalExpenses = expenseTotal + transactionExpenses

  const totalProfit = totalRevenue - totalExpenses

  const totalMachineryValue = machines
    .filter((m) => m.status !== 'SOLD')
    .reduce((sum, m) => sum + toNumber(m.currentValue), 0)

  const activeMachines = machines.filter((m) => m.status === 'ACTIVE').length
  const idleMachines = machines.filter((m) => m.status === 'IDLE').length
  const maintenanceMachines = machines.filter((m) => m.status === 'MAINTENANCE').length
  const partnershipMachines = machines.filter((m) => m.status === 'PARTNERSHIP').length

  const now = new Date()
  const thisMonth = monthKey(now)
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = monthKey(lastMonthDate)

  let thisMonthRevenue = 0
  let lastMonthRevenue = 0
  let thisMonthExpenses = 0
  let lastMonthExpenses = 0

  for (const sale of sales) {
    const key = monthKey(sale.createdAt)
    const amount = toNumber(sale.sellingPrice)
    if (key === thisMonth) thisMonthRevenue += amount
    if (key === lastMonth) lastMonthRevenue += amount
  }

  for (const tx of transactions) {
    const key = monthKey(tx.date)
    const amount = toNumber(tx.amount)
    if (tx.type === 'INCOME') {
      if (key === thisMonth) thisMonthRevenue += amount
      if (key === lastMonth) lastMonthRevenue += amount
    } else {
      if (key === thisMonth) thisMonthExpenses += amount
      if (key === lastMonth) lastMonthExpenses += amount
    }
  }

  for (const expense of expenses) {
    const key = monthKey(expense.date)
    const amount = toNumber(expense.amount)
    if (key === thisMonth) thisMonthExpenses += amount
    if (key === lastMonth) lastMonthExpenses += amount
  }

  const stats: DashboardStats = {
    totalRevenue,
    totalExpenses,
    totalProfit,
    totalMachineryValue,
    activeMachines,
    idleMachines,
    maintenanceMachines,
    partnershipMachines,
    revenueChange: pctChange(thisMonthRevenue, lastMonthRevenue),
    expensesChange: pctChange(thisMonthExpenses, lastMonthExpenses),
    profitChange: pctChange(thisMonthRevenue - thisMonthExpenses, lastMonthRevenue - lastMonthExpenses),
  }

  const monthlyCashFlow: ChartDataPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(d)
    let revenue = 0
    let monthExpenses = 0

    for (const sale of sales) {
      if (monthKey(sale.createdAt) === key) revenue += toNumber(sale.sellingPrice)
    }
    for (const tx of transactions) {
      if (monthKey(tx.date) !== key) continue
      if (tx.type === 'INCOME') revenue += toNumber(tx.amount)
      else monthExpenses += toNumber(tx.amount)
    }
    for (const expense of expenses) {
      if (monthKey(expense.date) === key) monthExpenses += toNumber(expense.amount)
    }

    monthlyCashFlow.push({
      name: MONTH_LABELS[d.getMonth()],
      revenue,
      expenses: monthExpenses,
      profit: revenue - monthExpenses,
    })
  }

  const categoryTotals = new Map<string, number>()
  for (const expense of expenses) {
    const cat = expense.category
    categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + toNumber(expense.amount))
  }

  const expenseBreakdown: ChartDataPoint[] = EXPENSE_CATEGORIES.map((cat) => ({
    name: shortCategoryName(cat.label),
    value: categoryTotals.get(cat.key) ?? 0,
  })).filter((row) => (row.value ?? 0) > 0)

  const machineUtilization: ChartDataPoint[] = machines
    .filter((m) => m.status !== 'SOLD')
    .map((m) => ({
      name: m.name.split(' ').slice(0, 2).join(' '),
      value: STATUS_UTILIZATION[m.status] ?? 50,
    }))

  return { stats, monthlyCashFlow, expenseBreakdown, machineUtilization }
}
