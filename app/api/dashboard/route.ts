import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/services/dashboard-service'
import { getDbErrorMessage } from '@/lib/db/errors'

export async function GET() {
  try {
    const data = await getDashboardData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
