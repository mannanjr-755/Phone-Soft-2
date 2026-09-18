import { NextResponse } from 'next/server'
import { machineService } from '@/lib/services/machine-service'
import { machineSchema } from '@/lib/validations/schemas'
import { getDbErrorMessage } from '@/lib/db/errors'

export async function GET() {
  try {
    const machines = await machineService.getAll()
    return NextResponse.json({ machines })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = machineSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const machine = await machineService.create(parsed.data)
    return NextResponse.json({ machine }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getDbErrorMessage(error) }, { status: 500 })
  }
}
