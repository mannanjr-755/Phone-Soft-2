import { NextResponse } from 'next/server'
import { notificationService } from '@/lib/services/financial-service'

export async function GET() {
  try {
    const notifications = await notificationService.getAll()
    return NextResponse.json({ notifications })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
