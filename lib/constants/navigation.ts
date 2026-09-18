import type { NavItem } from '@/types'

export const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { title: 'Sales', href: '/sales', icon: 'ShoppingCart' },
  { title: 'Purchases', href: '/purchases', icon: 'Receipt' },
  { title: 'Stock', href: '/inventory', icon: 'Warehouse' },
  { title: 'Customers', href: '/customers', icon: 'Users' },
  { title: 'Credit / Udhaar', href: '/credit', icon: 'CreditCard' },
  { title: 'Suppliers', href: '/suppliers', icon: 'Handshake' },
  { title: 'Expenses', href: '/expenses', icon: 'Receipt' },
  { title: 'Accounting', href: '/accounting', icon: 'Landmark' },
  { title: 'Cash & Bank', href: '/cash-bank', icon: 'Landmark' },
  { title: 'Reports', href: '/reports', icon: 'FileText' },
  { title: 'Notifications', href: '/notifications', icon: 'Bell' },
]

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  IDLE: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  MAINTENANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  PARTNERSHIP: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  RETIRED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  SOLD: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
}
