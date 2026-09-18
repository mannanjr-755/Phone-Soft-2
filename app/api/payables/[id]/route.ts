import { NextResponse } from 'next/server'
import { payableService } from '@/lib/services/financial-service'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await payableService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete payable'
    return NextResponse.json({ error: message }, { status: message === 'Payable not found' ? 404 : 400 })
  }
}
