import { toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'

export interface FinancialOverview {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  cashBalance: number
  receivablesTotal: number
  receivablesCount: number
  payablesTotal: number
  payablesCount: number
}

export async function getFinancialOverview(): Promise<FinancialOverview> {
  const [sales, expenses, transactions, bankAccounts, receivables, payables] = await Promise.all([
    prisma.sale.findMany(),
    prisma.expense.findMany(),
    prisma.transaction.findMany(),
    prisma.bankAccount.findMany(),
    prisma.receivable.findMany(),
    prisma.payable.findMany(),
  ])

  const salesIncome = sales.reduce((sum, s) => sum + toNumber(s.sellingPrice), 0)
  const transactionIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + toNumber(t.amount), 0)
  const totalIncome = salesIncome + transactionIncome

  const expenseRecords = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0)
  const transactionExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + toNumber(t.amount), 0)
  const totalExpenses = expenseRecords + transactionExpenses

  const cashBalance = bankAccounts.reduce((sum, a) => sum + toNumber(a.balance), 0)
  const receivablesTotal = receivables.reduce((sum, r) => sum + toNumber(r.amount), 0)
  const payablesTotal = payables.reduce((sum, p) => sum + toNumber(p.amount), 0)

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    cashBalance,
    receivablesTotal,
    receivablesCount: receivables.length,
    payablesTotal,
    payablesCount: payables.length,
  }
}
