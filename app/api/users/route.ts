import { NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'

export async function GET() {
  try {
    const users = await userService.getAll()
    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
