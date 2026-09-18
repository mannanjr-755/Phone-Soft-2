import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.sale.deleteMany()
  await prisma.expenseCategoryConfig.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.partner.deleteMany()
  await prisma.partnership.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.payable.deleteMany()
  await prisma.receivable.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash(
    process.env.DEMO_PASSWORD ?? 'cellcraft123',
    10,
  )

  await prisma.user.create({
    data: {
      username: process.env.DEMO_USERNAME ?? 'admincellcraft',
      email: 'admin@cellcraft.com',
      password: passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  const categories = [
    { key: 'ALL_PRODUCTS', label: '📱 All Products' },
    { key: 'SMARTPHONES', label: '📱 Smartphones' },
    { key: 'EARBUDS_HEADPHONES', label: '🎧 Earbuds & Headphones' },
    { key: 'SMARTWATCHES', label: '⌚ Smartwatches' },
    { key: 'CHARGERS_POWER_BANKS', label: '🔋 Chargers & Power Banks' },
    { key: 'CABLES_ADAPTERS', label: '🔌 Cables & Adapters' },
    { key: 'CASES_PROTECTORS', label: '🛡️ Cases & Screen Protectors' },
    { key: 'MEMORY_USB_DRIVES', label: '💾 Memory Cards & USB Drives' },
    { key: 'SPARE_PARTS', label: '🛠️ Spare Parts' },
    { key: 'OTHER_ACCESSORIES', label: '📦 Other Accessories' },
  ]
  await prisma.expenseCategoryConfig.createMany({ data: categories })

  console.log('Seed complete. Admin user and expense categories ready — no demo business records.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
