import type { Machine } from '@/types'

export function getMachineCostSummary(machine: Pick<Machine, 'purchaseCost' | 'workingHours' | 'purchaseDate' | 'operatingCosts' | 'salesExpenses'>) {
  const purchaseCost = machine.purchaseCost
  const operatingCosts = machine.operatingCosts ?? 0
  const salesExpenses = machine.salesExpenses ?? 0
  const totalCost = purchaseCost + operatingCosts + salesExpenses
  const monthsOwned = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(machine.purchaseDate).getTime()) / (30 * 24 * 60 * 60 * 1000),
    ),
  )
  const workingHours = machine.workingHours || 1

  return {
    purchaseCost,
    operatingCosts,
    salesExpenses,
    totalCost,
    costPerMonth: totalCost / monthsOwned,
    costPerWorkingHour: totalCost / workingHours,
  }
}

export function calculateSaleProfit(
  machine: Machine,
  salePrice: number,
  operatingCosts: number,
  salesExpenses: number,
) {
  const purchaseCost = machine.purchaseCost
  const totalCost = purchaseCost + operatingCosts + salesExpenses
  const profit = salePrice - totalCost
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

  return {
    salePrice,
    totalCost,
    operatingCosts,
    salesExpenses,
    purchaseCost,
    profit,
    margin,
    roi,
  }
}

/** @deprecated use getMachineCostSummary — kept for any legacy imports */
export const getMachineCostBreakdown = getMachineCostSummary
