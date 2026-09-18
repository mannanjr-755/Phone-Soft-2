import { NextResponse } from 'next/server'
import { creditService } from '@/lib/services/credit-service'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const updateSchema = z
  .object({
    fromDate: z.string().min(1, 'From date is required').optional(),
    tillDate: z.string().min(1, 'Till date is required').optional(),
    customerName: z.string().min(1, 'Customer name is required').optional(),
    mobileName: z.string().min(1, 'Mobile name is required').optional(),
    totalAmount: z.coerce.number().min(0, 'Total amount must be 0 or greater').optional(),
    paidAmount: z.coerce.number().min(0, 'Paid amount must be 0 or greater').optional(),
    notes: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.totalAmount !== undefined &&
      data.paidAmount !== undefined &&
      data.paidAmount > data.totalAmount
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Paid amount cannot exceed total amount',
        path: ['paidAmount'],
      })
    }
    if (data.fromDate && data.tillDate && data.tillDate < data.fromDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Till date must be on or after from date',
        path: ['tillDate'],
      })
    }
  })

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }

    const current = await creditService.getById(id)
    if (!current) {
      return NextResponse.json({ error: 'Credit record not found' }, { status: 404 })
    }

    const totalAmount = parsed.data.totalAmount ?? current.totalAmount
    const paidAmount = parsed.data.paidAmount ?? current.paidAmount
    if (paidAmount > totalAmount) {
      return NextResponse.json({ error: 'Paid amount cannot exceed total amount' }, { status: 400 })
    }

    const fromDate = parsed.data.fromDate ?? current.fromDate
    const tillDate = parsed.data.tillDate ?? current.tillDate
    if (tillDate < fromDate) {
      return NextResponse.json({ error: 'Till date must be on or after from date' }, { status: 400 })
    }

    const credit = await creditService.update(id, parsed.data)
    return NextResponse.json({ credit })
  } catch (error) {
    const message = error instanceof Error ? error.message : getDbErrorMessage(error)
    return NextResponse.json({ error: message }, { status: message.includes('not found') ? 404 : 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await creditService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : getDbErrorMessage(error)
    return NextResponse.json({ error: message }, { status: message.includes('not found') ? 404 : 400 })
  }
}
