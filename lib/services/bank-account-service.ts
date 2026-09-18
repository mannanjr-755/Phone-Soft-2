import { toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'

export interface BankAccountRecord {
  id: string
  name: string
  bank: string
  number: string
  balance: number
}

function mapBankAccount(record: {
  id: string
  name: string
  bankName: string
  accountNumber: string
  balance: Parameters<typeof toNumber>[0]
}): BankAccountRecord {
  return {
    id: record.id,
    name: record.name,
    bank: record.bankName,
    number: record.accountNumber,
    balance: toNumber(record.balance),
  }
}

export const bankAccountService = {
  async getAll(): Promise<BankAccountRecord[]> {
    const accounts = await prisma.bankAccount.findMany({ orderBy: { name: 'asc' } })
    return accounts.map(mapBankAccount)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.bankAccount.delete({ where: { id } })
    } catch {
      throw new Error('Bank account not found')
    }
  },
}
