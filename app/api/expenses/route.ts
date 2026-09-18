import { NextResponse } from 'next/server'
import { expenseService } from '@/lib/services/expense-service'
import { expenseSchema } from '@/lib/validations/schemas'
import { getDbErrorMessage } from '@/lib/db/errors'

export async function GET() {
  try {
    const expenses = await expenseService.getAll()
    return NextResponse.json({ expenses })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = expenseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const expense = await expenseService.create(parsed.data)
    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
