import type { Decimal } from '@prisma/client/runtime/library'

export function toNumber(value: Decimal | number | null | undefined): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  return Number(value)
}

export function toDateString(value: Date | string | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value.split('T')[0]
  return value.toISOString().split('T')[0]
}

export function toIsoString(value: Date | string): string {
  if (typeof value === 'string') return value
  return value.toISOString()
}
