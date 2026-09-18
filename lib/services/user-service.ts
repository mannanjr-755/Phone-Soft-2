import type { User, UserRole } from '@/types'
import { prisma } from '@/lib/prisma'

function mapUser(record: {
  id: string
  username: string
  email: string
  name: string
  role: string
  avatar: string | null
  active: boolean
}): User {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    name: record.name,
    role: record.role as UserRole,
    avatar: record.avatar ?? undefined,
    active: record.active,
  }
}

export const userService = {
  async getAll(): Promise<User[]> {
    const users = await prisma.user.findMany({ orderBy: { name: 'asc' } })
    return users.map(mapUser)
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({ where: { id } })
    } catch {
      throw new Error('User not found')
    }
  },
}
