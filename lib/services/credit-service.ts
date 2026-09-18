import { toDateString, toIsoString, toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'

export interface CreditRecordDto {
  id: string
  fromDate: string
  tillDate: string
  customerName: string
  mobileName: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreditInput {
  fromDate: string
  tillDate: string
  customerName: string
  mobileName: string
  totalAmount: number
  paidAmount?: number
  notes?: string | null
}

function mapCredit(record: {
  id: string
  fromDate: Date
  tillDate: Date
  customerName: string
  mobileName: string
  totalAmount: Parameters<typeof toNumber>[0]
  paidAmount: Parameters<typeof toNumber>[0]
  remainingAmount: Parameters<typeof toNumber>[0]
  notes: string | null
  createdAt: Date
  updatedAt: Date
}): CreditRecordDto {
  return {
    id: record.id,
    fromDate: toDateString(record.fromDate),
    tillDate: toDateString(record.tillDate),
    customerName: record.customerName,
    mobileName: record.mobileName,
    totalAmount: toNumber(record.totalAmount),
    paidAmount: toNumber(record.paidAmount),
    remainingAmount: toNumber(record.remainingAmount),
    notes: record.notes,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  }
}

function normalizeAmounts(totalAmount: number, paidAmount: number) {
  const total = Math.round(totalAmount * 100) / 100
  const paid = Math.round(paidAmount * 100) / 100
  const remaining = Math.round((total - paid) * 100) / 100
  return { totalAmount: total, paidAmount: paid, remainingAmount: remaining }
}

export const creditService = {
  async getAll(): Promise<CreditRecordDto[]> {
    const records = await prisma.creditRecord.findMany({ orderBy: { fromDate: 'desc' } })
    return records.map(mapCredit)
  },

  async getById(id: string): Promise<CreditRecordDto | null> {
    const record = await prisma.creditRecord.findUnique({ where: { id } })
    return record ? mapCredit(record) : null
  },

  async create(data: CreditInput): Promise<CreditRecordDto> {
    const paidAmount = data.paidAmount ?? 0
    const amounts = normalizeAmounts(data.totalAmount, paidAmount)
    const record = await prisma.creditRecord.create({
      data: {
        fromDate: new Date(data.fromDate),
        tillDate: new Date(data.tillDate),
        customerName: data.customerName.trim(),
        mobileName: data.mobileName.trim(),
        totalAmount: amounts.totalAmount,
        paidAmount: amounts.paidAmount,
        remainingAmount: amounts.remainingAmount,
        notes: data.notes?.trim() || null,
      },
    })
    return mapCredit(record)
  },

  async update(id: string, data: Partial<CreditInput>): Promise<CreditRecordDto> {
    const current = await prisma.creditRecord.findUnique({ where: { id } })
    if (!current) throw new Error('Credit record not found')

    const totalAmount = data.totalAmount ?? toNumber(current.totalAmount)
    const paidAmount = data.paidAmount ?? toNumber(current.paidAmount)
    const amounts = normalizeAmounts(totalAmount, paidAmount)

    const record = await prisma.creditRecord.update({
      where: { id },
      data: {
        fromDate: data.fromDate ? new Date(data.fromDate) : current.fromDate,
        tillDate: data.tillDate ? new Date(data.tillDate) : current.tillDate,
        customerName: data.customerName?.trim() ?? current.customerName,
        mobileName: data.mobileName?.trim() ?? current.mobileName,
        totalAmount: amounts.totalAmount,
        paidAmount: amounts.paidAmount,
        remainingAmount: amounts.remainingAmount,
        notes: data.notes !== undefined ? (data.notes?.trim() || null) : current.notes,
      },
    })
    return mapCredit(record)
  },

  async delete(id: string): Promise<void> {
    await prisma.creditRecord.delete({ where: { id } })
  },
}
