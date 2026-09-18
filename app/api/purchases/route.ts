import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const purchaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  qty: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
})

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ purchases })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = purchaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const purchase = await prisma.purchase.create({ data: parsed.data })
    return NextResponse.json({ purchase }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
