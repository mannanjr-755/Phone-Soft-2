import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  balance: z.coerce.number().min(0, 'Balance must be 0 or greater'),
})

export async function GET() {
  try {
    const accounts = await prisma.cashBankAccount.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ accounts })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = accountSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const account = await prisma.cashBankAccount.create({ data: parsed.data })
    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
