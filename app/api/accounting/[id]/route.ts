import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  desc: z.string().min(1).optional(),
  amount: z.coerce.number().min(0).optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const entry = await prisma.accountingEntry.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ entry })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update entry'
    return NextResponse.json({ error: message }, { status: message.includes('not found') ? 404 : 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.accountingEntry.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete entry'
    return NextResponse.json({ error: message }, { status: message.includes('not found') ? 404 : 400 })
  }
}
