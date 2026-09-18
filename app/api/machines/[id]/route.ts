import { NextResponse } from 'next/server'
import { machineService } from '@/lib/services/machine-service'
import { z } from 'zod'

const patchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('updateCosts'),
    operatingCosts: z.coerce.number().min(0),
    salesExpenses: z.coerce.number().min(0),
  }),
  z.object({
    action: z.literal('recordSale'),
    salePrice: z.coerce.number().min(0),
    operatingCosts: z.coerce.number().min(0),
    salesExpenses: z.coerce.number().min(0),
  }),
])

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const machine = await machineService.getById(id)
    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }
    return NextResponse.json({ machine })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch machine' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }

    const machine =
      parsed.data.action === 'updateCosts'
        ? await machineService.updateCosts(id, parsed.data.operatingCosts, parsed.data.salesExpenses)
        : await machineService.recordSale(
            id,
            parsed.data.salePrice,
            parsed.data.operatingCosts,
            parsed.data.salesExpenses,
          )

    return NextResponse.json({ machine })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update machine'
    return NextResponse.json({ error: message }, { status: message === 'Machine not found' ? 404 : 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await machineService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete machine'
    return NextResponse.json({ error: message }, { status: message === 'Machine not found' ? 404 : 400 })
  }
}
