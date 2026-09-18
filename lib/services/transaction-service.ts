import { toDateString, toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'

export interface TransactionRecord {
  id: string
  date: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  category: string
}

function mapTransaction(record: {
  id: string
  date: Date
  type: string
  description: string
  amount: Parameters<typeof toNumber>[0]
  category: string | null
}): TransactionRecord {
  return {
    id: record.id,
    date: toDateString(record.date),
    type: record.type as 'INCOME' | 'EXPENSE',
    description: record.description,
    amount: toNumber(record.amount),
    category: record.category ?? '',
  }
}

export const transactionService = {
  async getAll(): Promise<TransactionRecord[]> {
    const transactions = await prisma.transaction.findMany({ orderBy: { date: 'desc' } })
    return transactions.map(mapTransaction)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.transaction.delete({ where: { id } })
    } catch {
      throw new Error('Transaction not found')
    }
  },
}
