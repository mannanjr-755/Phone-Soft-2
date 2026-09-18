/** Profit = Selling Price - (Purchase Cost + Machine Cost) */
export function calculateSalesProfit(
  sellingPrice: number,
  purchaseCost: number,
  machineCost: number,
): number {
  return sellingPrice - (purchaseCost + machineCost)
}

export function calculateProfitMargin(sellingPrice: number, profit: number): number {
  return sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0
}
