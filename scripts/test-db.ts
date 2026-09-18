import { prisma } from '../lib/prisma'

async function main() {
  const machines = await prisma.machine.count()
  const sales = await prisma.sale.count()
  console.log('DB OK — machines:', machines, 'sales:', sales)
}

main()
  .catch((e) => {
    console.error('DB FAILED:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
