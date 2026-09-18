import { NextResponse } from 'next/server'
import { bankAccountService } from '@/lib/services/bank-account-service'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await bankAccountService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete bank account'
    return NextResponse.json({ error: message }, { status: message === 'Bank account not found' ? 404 : 400 })
  }
}
