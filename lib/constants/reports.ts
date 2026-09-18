export const REPORT_TYPES = [
  'Product Profit Report',
  'Expense Report',
  'Partnership Report',
  'Maintenance Report',
] as const

export type ReportType = (typeof REPORT_TYPES)[number]
