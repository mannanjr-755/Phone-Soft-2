import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  balance: z.coerce.number().min(0).optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const account = await prisma.cashBankAccount.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ account })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update account'
    return NextResponse.json({ error: message }, { status: message.includes('not found') ? 404 : 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.cashBankAccount.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete account'
    return NextResponse.json({ error: message }, { status: message.includes('not found') ? 404 : 400 })
  }
}
