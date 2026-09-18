import { NextResponse } from 'next/server'
import { salesService } from '@/lib/services/sales-service'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const salesSchema = z.object({
  itemName: z.string().min(1, 'Product/Item name is required'),
  purchaseCost: z.coerce.number().min(0, 'Purchase cost must be 0 or greater'),
  machineCost: z.coerce.number().min(0, 'Machine cost must be 0 or greater'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be 0 or greater'),
})

export async function GET() {
  try {
    const sales = await salesService.getAll()
    return NextResponse.json({ sales })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = salesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const sale = await salesService.create(parsed.data)
    return NextResponse.json({ sale }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
