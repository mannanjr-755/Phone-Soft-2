export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'ACCOUNTANT'
  | 'YARD_MANAGER'
  | 'OPERATOR'
  | 'PARTNER'

export type MachineStatus = 'ACTIVE' | 'IDLE' | 'MAINTENANCE' | 'PARTNERSHIP' | 'RETIRED' | 'SOLD'

export type ExpenseCategory =
  | 'ALL_PRODUCTS'
  | 'SMARTPHONES'
  | 'EARBUDS_HEADPHONES'
  | 'SMARTWATCHES'
  | 'CHARGERS_POWER_BANKS'
  | 'CABLES_ADAPTERS'
  | 'CASES_PROTECTORS'
  | 'MEMORY_USB_DRIVES'
  | 'SPARE_PARTS'
  | 'OTHER_ACCESSORIES'

export interface User {
  id: string
  username: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  active: boolean
}

export interface Machine {
  id: string
  name: string
  type: string
  brand: string
  model: string
  serialNumber: string
  registrationNumber?: string
  purchaseDate: string
  purchaseCost: number
  currentValue: number
  depreciationRate: number
  workingHours: number
  status: MachineStatus
  location?: string
  imageUrl?: string
  soldPrice?: number
  soldDate?: string
  saleProfit?: number
  totalOperatingCosts?: number
  profitMargin?: number
  roi?: number
  operatingCosts?: number
  salesExpenses?: number
}

export interface MachineCostBreakdown {
  purchaseCost: number
  fuelCost: number
  maintenanceCost: number
  repairCost: number
  operatorSalary: number
  transportationCost: number
  spareParts: number
  insurance: number
  registration: number
  otherCosts: number
  totalCost: number
  costPerMonth: number
  costPerWorkingHour: number
}

export interface MachineProfit {
  machineId: string
  machineName: string
  rentalIncome: number
  projectIncome: number
  monthlyRevenue: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  roi: number
}

export interface Expense {
  id: string
  category: ExpenseCategory
  amount: number
  date: string
  description: string
  machineId?: string
}

export interface Partnership {
  id: string
  name: string
  machineName: string
  partners: Partner[]
  totalInvestment: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
}

export interface Partner {
  id: string
  name: string
  ownershipPercentage: number
  investmentAmount: number
  expenseShare: number
  revenueShare: number
  netProfit: number
  outstandingPayment: number
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  totalMachineryValue: number
  activeMachines: number
  idleMachines: number
  maintenanceMachines: number
  partnershipMachines: number
  revenueChange: number
  expensesChange: number
  profitChange: number
}

export interface ChartDataPoint {
  name: string
  value?: number
  revenue?: number
  expenses?: number
  profit?: number
}

export interface NavItem {
  title: string
  href: string
  icon: string
  permission?: string
  children?: { title: string; href: string }[]
}
