import { NextResponse } from 'next/server'
import { receivableService } from '@/lib/services/financial-service'

export async function GET() {
  try {
    const receivables = await receivableService.getAll()
    return NextResponse.json({ receivables })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch receivables' }, { status: 500 })
  }
}
