import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'

const REPORT_TYPE = 'expense_monthly'

type ExclusionDelegate = {
  findMany: (args: {
    where: { reportType: string }
  }) => Promise<Array<{ monthKey: string }>>
  upsert: (args: {
    where: { monthKey: string }
    create: { monthKey: string; reportType: string }
    update: Record<string, never>
  }) => Promise<unknown>
}

function getExclusionDelegate(): ExclusionDelegate | null {
  const client = prisma as unknown as { monthlyReportExclusion?: ExclusionDelegate }
  return client.monthlyReportExclusion ?? null
}

export async function getHiddenMonthKeys(): Promise<Set<string>> {
  try {
    const delegate = getExclusionDelegate()

    if (delegate) {
      const exclusions = await delegate.findMany({ where: { reportType: REPORT_TYPE } })
      return new Set(exclusions.map((e) => e.monthKey))
    }

    const rows = await prisma.$queryRaw<Array<{ monthKey: string }>>`
      SELECT "monthKey" FROM "MonthlyReportExclusion"
      WHERE "reportType" = ${REPORT_TYPE}
    `
    return new Set(rows.map((r) => r.monthKey))
  } catch (error) {
    if (isMissingExclusionTable(error)) {
      return new Set()
    }
    throw error
  }
}

export async function hideMonthKey(monthKey: string): Promise<void> {
  try {
    const delegate = getExclusionDelegate()

    if (delegate) {
      await delegate.upsert({
        where: { monthKey },
        create: { monthKey, reportType: REPORT_TYPE },
        update: {},
      })
      return
    }

    await prisma.$executeRaw`
      INSERT INTO "MonthlyReportExclusion" ("id", "monthKey", "reportType", "createdAt")
      VALUES (${randomUUID()}, ${monthKey}, ${REPORT_TYPE}, NOW())
      ON CONFLICT ("monthKey") DO NOTHING
    `
  } catch (error) {
    if (isMissingExclusionTable(error)) {
      throw new Error(
        'Monthly report exclusions table is missing. Run: npm run db:push && npm run db:generate',
      )
    }
    throw error
  }
}

function isMissingExclusionTable(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes('monthlyreportexclusion') &&
    (message.includes('does not exist') || message.includes('relation'))
  )
}
