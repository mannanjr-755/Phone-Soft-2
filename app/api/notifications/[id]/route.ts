import { NextResponse } from 'next/server'
import { notificationService } from '@/lib/services/financial-service'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await notificationService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete notification'
    return NextResponse.json({ error: message }, { status: message === 'Notification not found' ? 404 : 400 })
  }
}
