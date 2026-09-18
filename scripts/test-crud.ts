import { machineService } from '../lib/services/machine-service'
import { salesService } from '../lib/services/sales-service'
import { prisma } from '../lib/prisma'

async function main() {
  const before = await prisma.machine.count()

  const created = await machineService.create({
    name: 'Persistence Test Machine',
    type: 'Test',
    brand: 'TestBrand',
    model: 'T1',
    serialNumber: `TEST-${Date.now()}`,
    purchaseDate: '2024-01-01',
    purchaseCost: 1000000,
    currentValue: 900000,
    depreciationRate: 10,
    workingHours: 100,
    status: 'ACTIVE',
    location: 'Test Yard',
  })

  const afterCreate = await prisma.machine.count()
  if (afterCreate !== before + 1) throw new Error('Create did not persist')

  await machineService.delete(created.id)
  const afterDelete = await prisma.machine.count()
  if (afterDelete !== before) throw new Error('Delete did not persist')

  const sale = await salesService.create({
    itemName: 'Test Sale Item',
    purchaseCost: 100,
    machineCost: 50,
    sellingPrice: 200,
  })
  const found = await salesService.getById(sale.id)
  if (!found) throw new Error('Sale create did not persist')
  await salesService.delete(sale.id)

  console.log('CRUD persistence test passed')
}

main()
  .catch((e) => {
    console.error('CRUD test FAILED:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
