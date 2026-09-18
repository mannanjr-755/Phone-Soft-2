import { NextResponse } from 'next/server'
import { partnershipService } from '@/lib/services/financial-service'

export async function GET() {
  try {
    const partnership = await partnershipService.getPrimary()
    return NextResponse.json({ partnership })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch partnership' }, { status: 500 })
  }
}
