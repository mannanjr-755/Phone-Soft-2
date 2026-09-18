export const EXPENSE_CATEGORIES = [
  { key: 'ALL_PRODUCTS', label: '📱 All Products' },
  { key: 'SMARTPHONES', label: '📱 Smartphones' },
  { key: 'EARBUDS_HEADPHONES', label: '🎧 Earbuds & Headphones' },
  { key: 'SMARTWATCHES', label: '⌚ Smartwatches' },
  { key: 'CHARGERS_POWER_BANKS', label: '🔋 Chargers & Power Banks' },
  { key: 'CABLES_ADAPTERS', label: '🔌 Cables & Adapters' },
  { key: 'CASES_PROTECTORS', label: '🛡️ Cases & Screen Protectors' },
  { key: 'MEMORY_USB_DRIVES', label: '💾 Memory Cards & USB Drives' },
  { key: 'SPARE_PARTS', label: '🛠️ Spare Parts' },
  { key: 'OTHER_ACCESSORIES', label: '📦 Other Accessories' },
] as const

export function shortCategoryName(label: string): string {
  const clean = label.replace(/\p{Emoji}\uFE0F?/gu, '').trim()
  return clean.split(' ')[0] || label
}

export const REPORT_PERIODS = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const
