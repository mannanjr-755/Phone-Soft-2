import { NextResponse } from 'next/server'
import { bankAccountService } from '@/lib/services/bank-account-service'

export async function GET() {
  try {
    const accounts = await bankAccountService.getAll()
    return NextResponse.json({ accounts })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 })
  }
}
