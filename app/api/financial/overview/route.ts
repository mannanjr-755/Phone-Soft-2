import { NextResponse } from 'next/server'
import { getFinancialOverview } from '@/lib/services/financial-overview-service'
import { getDbErrorMessage } from '@/lib/db/errors'

export async function GET() {
  try {
    const overview = await getFinancialOverview()
    return NextResponse.json({ overview })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
