import { NextResponse } from 'next/server'
import { creditService } from '@/lib/services/credit-service'
import { getDbErrorMessage } from '@/lib/db/errors'
import { z } from 'zod'

const creditSchema = z
  .object({
    fromDate: z.string().min(1, 'From date is required'),
    tillDate: z.string().min(1, 'Till date is required'),
    customerName: z.string().min(1, 'Customer name is required'),
    mobileName: z.string().min(1, 'Mobile name is required'),
    totalAmount: z.coerce.number().min(0, 'Total amount must be 0 or greater'),
    paidAmount: z.coerce.number().min(0, 'Paid amount must be 0 or greater').optional().default(0),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => data.paidAmount <= data.totalAmount, {
    message: 'Paid amount cannot exceed total amount',
    path: ['paidAmount'],
  })
  .refine((data) => data.tillDate >= data.fromDate, {
    message: 'Till date must be on or after from date',
    path: ['tillDate'],
  })

export async function GET() {
  try {
    const credits = await creditService.getAll()
    return NextResponse.json({ credits })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = creditSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const credit = await creditService.create(parsed.data)
    return NextResponse.json({ credit }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
