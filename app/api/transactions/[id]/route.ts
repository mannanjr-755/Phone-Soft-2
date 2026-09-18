import { NextResponse } from 'next/server'
import { transactionService } from '@/lib/services/transaction-service'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await transactionService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete transaction'
    return NextResponse.json({ error: message }, { status: message === 'Transaction not found' ? 404 : 400 })
  }
}
