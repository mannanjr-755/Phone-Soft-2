import { NextResponse } from 'next/server'
import { transactionService } from '@/lib/services/transaction-service'

export async function GET() {
  try {
    const transactions = await transactionService.getAll()
    return NextResponse.json({ transactions })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
