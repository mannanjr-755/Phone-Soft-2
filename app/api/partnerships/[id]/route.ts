import { NextResponse } from 'next/server'
import { partnershipService } from '@/lib/services/financial-service'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await partnershipService.deletePartnership(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete partnership'
    return NextResponse.json({ error: message }, { status: message === 'Partnership not found' ? 404 : 400 })
  }
}
