import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contact: z.string().min(1, 'Contact is required'),
})

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ suppliers })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = supplierSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const supplier = await prisma.supplier.create({ data: parsed.data })
    return NextResponse.json({ supplier }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
