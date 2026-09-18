import { NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await userService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user'
    return NextResponse.json({ error: message }, { status: message === 'User not found' ? 404 : 400 })
  }
}
