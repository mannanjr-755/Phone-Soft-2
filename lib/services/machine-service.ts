import type { MachineStatus } from '@/types'
import { calculateSaleProfit } from '@/lib/machinery/calculations'
import { toDateString, toIsoString, toNumber } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'
import type { MachineFormData } from '@/lib/validations/schemas'
import type { Machine } from '@/types'

function mapMachine(record: {
  id: string
  name: string
  type: string
  brand: string
  model: string
  serialNumber: string
  registrationNumber: string | null
  purchaseDate: Date
  purchaseCost: Parameters<typeof toNumber>[0]
  currentValue: Parameters<typeof toNumber>[0]
  depreciationRate: Parameters<typeof toNumber>[0]
  workingHours: number
  status: string
  location: string | null
  imageUrl: string | null
  operatingCosts: Parameters<typeof toNumber>[0]
  salesExpenses: Parameters<typeof toNumber>[0]
  soldPrice: Parameters<typeof toNumber>[0] | null
  soldDate: Date | null
  saleProfit: Parameters<typeof toNumber>[0] | null
  totalOperatingCosts: Parameters<typeof toNumber>[0] | null
  profitMargin: Parameters<typeof toNumber>[0] | null
  roi: Parameters<typeof toNumber>[0] | null
}): Machine {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    brand: record.brand,
    model: record.model,
    serialNumber: record.serialNumber,
    registrationNumber: record.registrationNumber ?? undefined,
    purchaseDate: toDateString(record.purchaseDate),
    purchaseCost: toNumber(record.purchaseCost),
    currentValue: toNumber(record.currentValue),
    depreciationRate: toNumber(record.depreciationRate),
    workingHours: record.workingHours,
    status: record.status as MachineStatus,
    location: record.location ?? undefined,
    imageUrl: record.imageUrl ?? undefined,
    operatingCosts: toNumber(record.operatingCosts),
    salesExpenses: toNumber(record.salesExpenses),
    soldPrice: record.soldPrice != null ? toNumber(record.soldPrice) : undefined,
    soldDate: record.soldDate ? toDateString(record.soldDate) : undefined,
    saleProfit: record.saleProfit != null ? toNumber(record.saleProfit) : undefined,
    totalOperatingCosts: record.totalOperatingCosts != null ? toNumber(record.totalOperatingCosts) : undefined,
    profitMargin: record.profitMargin != null ? toNumber(record.profitMargin) : undefined,
    roi: record.roi != null ? toNumber(record.roi) : undefined,
  }
}

export const machineService = {
  async getAll(): Promise<Machine[]> {
    const machines = await prisma.machine.findMany({ orderBy: { createdAt: 'desc' } })
    return machines.map(mapMachine)
  },

  async getById(id: string): Promise<Machine | null> {
    const machine = await prisma.machine.findUnique({ where: { id } })
    return machine ? mapMachine(machine) : null
  },

  async create(data: MachineFormData): Promise<Machine> {
    const machine = await prisma.machine.create({
      data: {
        name: data.name,
        type: data.type,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        registrationNumber: data.registrationNumber || null,
        purchaseDate: new Date(data.purchaseDate),
        purchaseCost: data.purchaseCost,
        currentValue: data.currentValue,
        depreciationRate: data.depreciationRate,
        workingHours: data.workingHours,
        status: data.status,
        location: data.location || null,
      },
    })
    return mapMachine(machine)
  },

  async updateCosts(id: string, operatingCosts: number, salesExpenses: number): Promise<Machine> {
    const machine = await prisma.machine.update({
      where: { id },
      data: { operatingCosts, salesExpenses },
    })
    return mapMachine(machine)
  },

  async recordSale(
    id: string,
    salePrice: number,
    operatingCosts: number,
    salesExpenses: number,
  ): Promise<Machine> {
    const current = await prisma.machine.findUnique({ where: { id } })
    if (!current) throw new Error('Machine not found')

    const machineData = mapMachine(current)
    const result = calculateSaleProfit(machineData, salePrice, operatingCosts, salesExpenses)

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        status: 'SOLD',
        operatingCosts,
        salesExpenses,
        soldPrice: salePrice,
        soldDate: new Date(),
        saleProfit: result.profit,
        totalOperatingCosts: operatingCosts,
        profitMargin: result.margin,
        roi: result.roi,
        currentValue: 0,
      },
    })
    return mapMachine(machine)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.machine.delete({ where: { id } })
    } catch {
      throw new Error('Machine not found')
    }
  },
}
