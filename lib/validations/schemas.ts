import { z } from 'zod'

export const machineSchema = z.object({
  name: z.string().min(1, 'Machine name is required'),
  type: z.string().min(1, 'Machine type is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  registrationNumber: z.string().optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchaseCost: z.coerce.number().min(0, 'Purchase cost must be positive'),
  currentValue: z.coerce.number().min(0, 'Current value must be positive'),
  depreciationRate: z.coerce.number().min(0).max(100),
  workingHours: z.coerce.number().min(0),
  status: z.enum(['ACTIVE', 'IDLE', 'MAINTENANCE', 'PARTNERSHIP', 'RETIRED']),
  location: z.string().optional(),
})

export const expenseSchema = z.object({
  category: z.enum([
    'ALL_PRODUCTS', 'SMARTPHONES', 'EARBUDS_HEADPHONES', 'SMARTWATCHES',
    'CHARGERS_POWER_BANKS', 'CABLES_ADAPTERS', 'CASES_PROTECTORS',
    'MEMORY_USB_DRIVES', 'SPARE_PARTS', 'OTHER_ACCESSORIES',
  ]),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  machineId: z.string().optional(),
})

export type MachineFormData = z.infer<typeof machineSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>
