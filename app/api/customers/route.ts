import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(1, 'Phone is required'),
})

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ customers })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = customerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const customer = await prisma.customer.create({ data: parsed.data })
    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
