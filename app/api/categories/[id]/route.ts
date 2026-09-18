import { NextResponse } from 'next/server'
import { categoryService } from '@/lib/services/category-service'
import { z } from 'zod'

const updateSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  key: z.string().optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
    }
    const category = await categoryService.update(id, parsed.data)
    return NextResponse.json({ category })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update category'
    return NextResponse.json({ error: message }, { status: message === 'Category not found' ? 404 : 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await categoryService.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete category'
    return NextResponse.json({ error: message }, { status: message === 'Category not found' ? 404 : 400 })
  }
}
