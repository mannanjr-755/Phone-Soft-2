import { toIsoString } from '@/lib/db/serialize'
import { prisma } from '@/lib/prisma'

export interface ExpenseCategoryRecord {
  id: string
  key: string
  label: string
  description?: string
  createdAt: string
  updatedAt: string
}

function slugifyKey(label: string): string {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || `CAT_${Date.now()}`
}

function mapCategory(record: {
  id: string
  key: string
  label: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}): ExpenseCategoryRecord {
  return {
    id: record.id,
    key: record.key,
    label: record.label,
    description: record.description ?? undefined,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  }
}

export const categoryService = {
  async getAll(): Promise<ExpenseCategoryRecord[]> {
    const categories = await prisma.expenseCategoryConfig.findMany({ orderBy: { label: 'asc' } })
    return categories.map(mapCategory)
  },

  async getById(id: string): Promise<ExpenseCategoryRecord | null> {
    const category = await prisma.expenseCategoryConfig.findUnique({ where: { id } })
    return category ? mapCategory(category) : null
  },

  async create(data: { label: string; description?: string; key?: string }): Promise<ExpenseCategoryRecord> {
    const key = data.key?.trim().toUpperCase() || slugifyKey(data.label)
    const existing = await prisma.expenseCategoryConfig.findUnique({ where: { key } })
    if (existing) throw new Error('A category with this key already exists')

    const category = await prisma.expenseCategoryConfig.create({
      data: {
        key,
        label: data.label.trim(),
        description: data.description?.trim() || null,
      },
    })
    return mapCategory(category)
  },

  async update(
    id: string,
    data: { label?: string; description?: string; key?: string },
  ): Promise<ExpenseCategoryRecord> {
    const current = await prisma.expenseCategoryConfig.findUnique({ where: { id } })
    if (!current) throw new Error('Category not found')

    const label = data.label?.trim() ?? current.label
    const key = data.key?.trim().toUpperCase() ?? current.key

    const duplicate = await prisma.expenseCategoryConfig.findFirst({
      where: { key, NOT: { id } },
    })
    if (duplicate) throw new Error('A category with this key already exists')

    const category = await prisma.expenseCategoryConfig.update({
      where: { id },
      data: {
        label,
        key,
        description: data.description !== undefined ? data.description.trim() || null : current.description,
      },
    })
    return mapCategory(category)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.expenseCategoryConfig.delete({ where: { id } })
    } catch {
      throw new Error('Category not found')
    }
  },
}
