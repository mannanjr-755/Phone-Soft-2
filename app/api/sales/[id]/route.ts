import { NextResponse } from 'next/server'
import { salesService } from '@/lib/services/sales-service'
import { z } from 'zod'

const updateSchema = z.object({
  itemName: z.string().min(1).optional(),
  purchaseCost: z.coerce.number().min(0).optional(),
  machineCost: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0).optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const sale = await salesService.update(id, parsed.data)
    return NextResponse.json({ sale })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update sale'
    return NextResponse.json({ error: message }, { status: message === 'Sales record not found' ? 404 : 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await salesService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete sale'
    return NextResponse.json({ error: message }, { status: message === 'Sales record not found' ? 404 : 400 })
  }
}
