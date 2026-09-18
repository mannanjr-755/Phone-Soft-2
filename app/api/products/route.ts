import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  stock: z.coerce.number().int().min(0, 'Stock quantity must be 0 or greater'),
})

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const product = await prisma.product.create({ data: parsed.data })
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
