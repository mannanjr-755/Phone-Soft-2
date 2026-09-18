import type { UserRole } from '@/types'

export type Permission =
  | 'dashboard.view'
  | 'expenses.view'
  | 'expenses.manage'
  | 'machinery.view'
  | 'machinery.manage'
  | 'machine-costs.view'
  | 'machine-profit.view'
  | 'sales.view'
  | 'sales.manage'
  | 'partnerships.view'
  | 'partnerships.manage'
  | 'financial.view'
  | 'financial.manage'
  | 'reports.view'
  | 'reports.export'
  | 'analytics.view'
  | 'notifications.view'
  | 'users.view'
  | 'users.manage'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'dashboard.view', 'expenses.view', 'expenses.manage',
    'machinery.view', 'machinery.manage', 'machine-costs.view',
    'machine-profit.view', 'sales.view', 'sales.manage',
    'partnerships.view', 'partnerships.manage', 'financial.view',
    'financial.manage', 'reports.view', 'reports.export',
    'analytics.view', 'notifications.view', 'users.view', 'users.manage',
  ],
  MANAGER: [
    'dashboard.view', 'expenses.view', 'expenses.manage',
    'machinery.view', 'machinery.manage', 'machine-costs.view',
    'machine-profit.view', 'sales.view', 'sales.manage',
    'partnerships.view', 'financial.view', 'reports.view',
    'reports.export', 'analytics.view', 'notifications.view',
  ],
  ACCOUNTANT: [
    'dashboard.view', 'expenses.view', 'expenses.manage',
    'machinery.view', 'machine-costs.view', 'machine-profit.view',
    'sales.view', 'sales.manage', 'financial.view', 'financial.manage', 'reports.view',
    'reports.export', 'analytics.view', 'notifications.view',
  ],
  YARD_MANAGER: [
    'dashboard.view', 'expenses.view', 'machinery.view',
    'machine-costs.view', 'notifications.view', 'reports.view',
  ],
  OPERATOR: [
    'dashboard.view', 'machinery.view', 'machine-costs.view',
    'notifications.view',
  ],
  PARTNER: [
    'dashboard.view', 'machinery.view', 'machine-profit.view', 'sales.view',
    'partnerships.view', 'reports.view', 'analytics.view',
    'notifications.view',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}
