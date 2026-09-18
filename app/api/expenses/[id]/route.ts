import { NextResponse } from 'next/server'
import { expenseService } from '@/lib/services/expense-service'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await expenseService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete expense'
    return NextResponse.json({ error: message }, { status: message === 'Expense not found' ? 404 : 400 })
  }
}
