import { calculateSalesProfit } from '@/lib/sales/calculations'
import { toIsoString, toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'

export interface SalesRecord {
  id: string
  itemName: string
  purchaseCost: number
  machineCost: number
  sellingPrice: number
  profit: number
  createdAt: string
  updatedAt: string
}

function mapSale(record: {
  id: string
  itemName: string
  purchaseCost: Parameters<typeof toNumber>[0]
  machineCost: Parameters<typeof toNumber>[0]
  sellingPrice: Parameters<typeof toNumber>[0]
  profit: Parameters<typeof toNumber>[0]
  createdAt: Date
  updatedAt: Date
}): SalesRecord {
  return {
    id: record.id,
    itemName: record.itemName,
    purchaseCost: toNumber(record.purchaseCost),
    machineCost: toNumber(record.machineCost),
    sellingPrice: toNumber(record.sellingPrice),
    profit: toNumber(record.profit),
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  }
}

export const salesService = {
  async getAll(): Promise<SalesRecord[]> {
    const sales = await prisma.sale.findMany({ orderBy: { updatedAt: 'desc' } })
    return sales.map(mapSale)
  },

  async getById(id: string): Promise<SalesRecord | null> {
    const sale = await prisma.sale.findUnique({ where: { id } })
    return sale ? mapSale(sale) : null
  },

  async create(data: {
    itemName: string
    purchaseCost: number
    machineCost: number
    sellingPrice: number
  }): Promise<SalesRecord> {
    const profit = calculateSalesProfit(data.sellingPrice, data.purchaseCost, data.machineCost)
    const sale = await prisma.sale.create({
      data: {
        itemName: data.itemName.trim(),
        purchaseCost: data.purchaseCost,
        machineCost: data.machineCost,
        sellingPrice: data.sellingPrice,
        profit,
      },
    })
    return mapSale(sale)
  },

  async update(
    id: string,
    data: Partial<{
      itemName: string
      purchaseCost: number
      machineCost: number
      sellingPrice: number
    }>,
  ): Promise<SalesRecord> {
    const current = await prisma.sale.findUnique({ where: { id } })
    if (!current) throw new Error('Sales record not found')

    const itemName = data.itemName?.trim() ?? current.itemName
    const purchaseCost = data.purchaseCost ?? toNumber(current.purchaseCost)
    const machineCost = data.machineCost ?? toNumber(current.machineCost)
    const sellingPrice = data.sellingPrice ?? toNumber(current.sellingPrice)
    const profit = calculateSalesProfit(sellingPrice, purchaseCost, machineCost)

    const sale = await prisma.sale.update({
      where: { id },
      data: { itemName, purchaseCost, machineCost, sellingPrice, profit },
    })
    return mapSale(sale)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.sale.delete({ where: { id } })
    } catch {
      throw new Error('Sales record not found')
    }
  },
}
