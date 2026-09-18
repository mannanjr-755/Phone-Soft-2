import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const entrySchema = z.object({
  desc: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0, 'Amount must be 0 or greater'),
})

export async function GET() {
  try {
    const entries = await prisma.accountingEntry.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ entries })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = entrySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const entry = await prisma.accountingEntry.create({ data: parsed.data })
    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
