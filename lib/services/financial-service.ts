import type { Notification, Partner, Partnership } from '@/types'
import { toDateString, toIsoString, toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'

function mapPartner(record: {
  id: string
  name: string
  ownershipPercentage: Parameters<typeof toNumber>[0]
  investmentAmount: Parameters<typeof toNumber>[0]
  expenseShare: Parameters<typeof toNumber>[0]
  revenueShare: Parameters<typeof toNumber>[0]
  netProfit: Parameters<typeof toNumber>[0]
  outstandingPayment: Parameters<typeof toNumber>[0]
}): Partner {
  return {
    id: record.id,
    name: record.name,
    ownershipPercentage: toNumber(record.ownershipPercentage),
    investmentAmount: toNumber(record.investmentAmount),
    expenseShare: toNumber(record.expenseShare),
    revenueShare: toNumber(record.revenueShare),
    netProfit: toNumber(record.netProfit),
    outstandingPayment: toNumber(record.outstandingPayment),
  }
}

function mapPartnership(record: {
  id: string
  name: string
  machineName: string | null
  totalInvestment: Parameters<typeof toNumber>[0]
  totalRevenue: Parameters<typeof toNumber>[0]
  totalExpenses: Parameters<typeof toNumber>[0]
  netProfit: Parameters<typeof toNumber>[0]
  partners: Parameters<typeof mapPartner>[0][]
}): Partnership {
  return {
    id: record.id,
    name: record.name,
    machineName: record.machineName ?? '',
    totalInvestment: toNumber(record.totalInvestment),
    totalRevenue: toNumber(record.totalRevenue),
    totalExpenses: toNumber(record.totalExpenses),
    netProfit: toNumber(record.netProfit),
    partners: record.partners.map(mapPartner),
  }
}

export const partnershipService = {
  async getPrimary(): Promise<Partnership | null> {
    const partnership = await prisma.partnership.findFirst({
      include: { partners: true },
      orderBy: { createdAt: 'asc' },
    })
    return partnership ? mapPartnership(partnership) : null
  },

  async deletePartnership(id: string): Promise<void> {
    try {
      await prisma.partnership.delete({ where: { id } })
    } catch {
      throw new Error('Partnership not found')
    }
  },

  async deletePartner(partnerId: string): Promise<void> {
    try {
      await prisma.partner.delete({ where: { id: partnerId } })
    } catch {
      throw new Error('Partner not found')
    }
  },
}

function mapNotification(record: {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
}): Notification {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    message: record.message,
    read: record.read,
    createdAt: toIsoString(record.createdAt),
  }
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } })
    return notifications.map(mapNotification)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.notification.delete({ where: { id } })
    } catch {
      throw new Error('Notification not found')
    }
  },
}

export interface PayableRecord {
  id: string
  vendor: string
  invoice: string
  amount: number
  dueDate: string
  status: string
}

export interface ReceivableRecord {
  id: string
  client: string
  invoice: string
  amount: number
  dueDate: string
  status: string
}

function mapPayable(record: {
  id: string
  vendor: string
  invoice: string
  amount: Parameters<typeof toNumber>[0]
  dueDate: Date
  status: string
}): PayableRecord {
  return {
    id: record.id,
    vendor: record.vendor,
    invoice: record.invoice,
    amount: toNumber(record.amount),
    dueDate: toDateString(record.dueDate),
    status: record.status,
  }
}

function mapReceivable(record: {
  id: string
  client: string
  invoice: string
  amount: Parameters<typeof toNumber>[0]
  dueDate: Date
  status: string
}): ReceivableRecord {
  return {
    id: record.id,
    client: record.client,
    invoice: record.invoice,
    amount: toNumber(record.amount),
    dueDate: toDateString(record.dueDate),
    status: record.status,
  }
}

export const payableService = {
  async getAll(): Promise<PayableRecord[]> {
    const payables = await prisma.payable.findMany({ orderBy: { dueDate: 'asc' } })
    return payables.map(mapPayable)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.payable.delete({ where: { id } })
    } catch {
      throw new Error('Payable not found')
    }
  },
}

export const receivableService = {
  async getAll(): Promise<ReceivableRecord[]> {
    const receivables = await prisma.receivable.findMany({ orderBy: { dueDate: 'asc' } })
    return receivables.map(mapReceivable)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.receivable.delete({ where: { id } })
    } catch {
      throw new Error('Receivable not found')
    }
  },
}
