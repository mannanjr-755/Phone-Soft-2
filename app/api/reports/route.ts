import { NextResponse } from 'next/server'
import { getReportData, REPORT_TYPES } from '@/lib/services/reports-service'
import { getDbErrorMessage } from '@/lib/db/errors'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json({ reportTypes: REPORT_TYPES })
    }

    if (!REPORT_TYPES.includes(type as (typeof REPORT_TYPES)[number])) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    const rows = await getReportData(type)
    return NextResponse.json({ rows, reportType: type })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
