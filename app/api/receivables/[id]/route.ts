import { NextResponse } from 'next/server'
import { receivableService } from '@/lib/services/financial-service'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await receivableService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete receivable'
    return NextResponse.json({ error: message }, { status: message === 'Receivable not found' ? 404 : 400 })
  }
}
