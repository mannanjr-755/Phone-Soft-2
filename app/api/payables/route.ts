import { NextResponse } from 'next/server'
import { payableService } from '@/lib/services/financial-service'

export async function GET() {
  try {
    const payables = await payableService.getAll()
    return NextResponse.json({ payables })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payables' }, { status: 500 })
  }
}
