import { REPORT_TYPES, type ReportType } from '@/lib/constants/reports'
import { calculateProfitMargin } from '@/lib/sales/calculations'
import { toDateString, toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'
import type { Expense } from '@/types'

export { REPORT_TYPES, type ReportType }

export interface MachineProfitReportRow {
  id: string
  itemName: string
  purchaseCost: number
  machineCost: number
  sellingPrice: number
  profit: number
  profitMargin: number
  roi: number
}

export interface PartnershipReportRow {
  id: string
  name: string
  machineName: string
  totalInvestment: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  partnerCount: number
}

export type ReportRow = MachineProfitReportRow | Expense | PartnershipReportRow

function mapPartnership(record: {
  id: string
  name: string
  machineName: string | null
  totalInvestment: Parameters<typeof toNumber>[0]
  totalRevenue: Parameters<typeof toNumber>[0]
  totalExpenses: Parameters<typeof toNumber>[0]
  netProfit: Parameters<typeof toNumber>[0]
  partners: unknown[]
}): PartnershipReportRow {
  return {
    id: record.id,
    name: record.name,
    machineName: record.machineName ?? '',
    totalInvestment: toNumber(record.totalInvestment),
    totalRevenue: toNumber(record.totalRevenue),
    totalExpenses: toNumber(record.totalExpenses),
    netProfit: toNumber(record.netProfit),
    partnerCount: record.partners.length,
  }
}

function mapExpense(record: {
  id: string
  category: string
  amount: Parameters<typeof toNumber>[0]
  date: Date
  description: string
  machineId: string | null
}): Expense {
  return {
    id: record.id,
    category: record.category as Expense['category'],
    amount: toNumber(record.amount),
    date: toDateString(record.date),
    description: record.description,
    machineId: record.machineId ?? undefined,
  }
}

export async function getMachineProfitReport(): Promise<MachineProfitReportRow[]> {
  const sales = await prisma.sale.findMany({ orderBy: { updatedAt: 'desc' } })
  return sales.map((sale) => {
    const purchaseCost = toNumber(sale.purchaseCost)
    const machineCost = toNumber(sale.machineCost)
    const sellingPrice = toNumber(sale.sellingPrice)
    const profit = toNumber(sale.profit)
    const totalExpenses = purchaseCost + machineCost
    return {
      id: sale.id,
      itemName: sale.itemName,
      purchaseCost,
      machineCost,
      sellingPrice,
      profit,
      profitMargin: calculateProfitMargin(sellingPrice, profit),
      roi: totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0,
    }
  })
}

export async function getExpenseReport(): Promise<Expense[]> {
  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } })
  return expenses.map(mapExpense)
}

export async function getMaintenanceReport(): Promise<Expense[]> {
  const expenses = await prisma.expense.findMany({
    where: { category: 'SPARE_PARTS' },
    orderBy: { date: 'desc' },
  })
  return expenses.map(mapExpense)
}

export async function getPartnershipReport(): Promise<PartnershipReportRow[]> {
  const partnerships = await prisma.partnership.findMany({
    include: { partners: true },
    orderBy: { createdAt: 'desc' },
  })
  return partnerships.map(mapPartnership)
}

export async function getReportData(reportType: string): Promise<ReportRow[]> {
  switch (reportType) {
    case 'Machine Profit Report':
      return getMachineProfitReport()
    case 'Expense Report':
      return getExpenseReport()
    case 'Partnership Report':
      return getPartnershipReport()
    case 'Maintenance Report':
      return getMaintenanceReport()
    default:
      return []
  }
}