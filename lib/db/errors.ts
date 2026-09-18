import { Prisma } from '@prisma/client'

export function getDbErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    if (error.message.includes("Can't reach database server")) {
      return 'Database server is unreachable. Start the database with `npm run dev:db` (local) or check your production DATABASE_URL on Vercel.'
    }
    const detail = error.message.split('\n').find((line) => line.includes('at '))
    return `Database connection failed. Ensure PostgreSQL is running and DATABASE_URL is set correctly.${detail ? ` ${detail.trim()}` : ''}`
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P1001') {
      return 'Database server is unreachable. Start the database with `npm run dev:db` (local) or check your production DATABASE_URL on Vercel.'
    }
    if (error.code === 'P2025') {
      return 'Record not found.'
    }
  }
  if (error instanceof Error) {
    if (error.message.includes("Can't reach database server")) {
      return 'Database server is unreachable. Run `npm run dev:db` locally, then restart the app.'
    }
    return error.message
  }
  return 'Database operation failed'
}

export function isNotFoundError(error: unknown, fallbackMessage: string): boolean {
  return error instanceof Error && error.message === fallbackMessage
}
