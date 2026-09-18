import { NextResponse } from 'next/server'
import { categoryService } from '@/lib/services/category-service'
import { z } from 'zod'

const createSchema = z.object({
  label: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  key: z.string().optional(),
})

export async function GET() {
  try {
    const categories = await categoryService.getAll()
    return NextResponse.json({ categories })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const category = await categoryService.create(parsed.data)
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 400 },
    )
  }
}
