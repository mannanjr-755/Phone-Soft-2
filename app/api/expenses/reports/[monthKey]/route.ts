import { NextResponse } from 'next/server'
import { monthlyReportsService } from '@/lib/services/monthly-reports-service'
import { getDbErrorMessage } from '@/lib/db/errors'

export async function DELETE(_request: Request, { params }: { params: Promise<{ monthKey: string }> }) {
  try {
    const { monthKey } = await params
    const decoded = decodeURIComponent(monthKey)
    if (!/^\d{4}-\d{1,2}$/.test(decoded)) {
      return NextResponse.json({ error: 'Invalid month key' }, { status: 400 })
    }
    await monthlyReportsService.hideMonth(decoded)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
