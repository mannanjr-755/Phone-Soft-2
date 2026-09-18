import type { Expense, ExpenseCategory } from '@/types'
import { toDateString, toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'

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
    category: record.category as ExpenseCategory,
    amount: toNumber(record.amount),
    date: toDateString(record.date),
    description: record.description,
    machineId: record.machineId ?? undefined,
  }
}

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } })
    return expenses.map(mapExpense)
  },

  async create(data: {
    category: ExpenseCategory
    amount: number
    date: string
    description: string
    machineId?: string
  }): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        category: data.category,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        machineId: data.machineId || null,
      },
    })
    return mapExpense(expense)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.expense.delete({ where: { id } })
    } catch {
      throw new Error('Expense not found')
    }
  },
}
