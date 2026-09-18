import { NextResponse } from 'next/server'
import { monthlyReportsService } from '@/lib/services/monthly-reports-service'
import { getDbErrorMessage } from '@/lib/db/errors'

export async function GET() {
  try {
    const data = await monthlyReportsService.getReports()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
