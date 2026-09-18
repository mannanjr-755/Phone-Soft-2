'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Receipt, Truck, Calculator, TrendingUp, ShoppingCart, Warehouse,
  Handshake, Landmark, FileText, BarChart3, Bell, Users, CreditCard, ChevronDown,
  X, PanelLeftClose, PanelLeft, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/layout/brand-logo'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Receipt, Truck, Calculator, TrendingUp, ShoppingCart, Warehouse,
  Handshake, Landmark, FileText, BarChart3, Bell, Users, CreditCard, Settings,
}

interface SidebarProps {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-primary/10 bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('flex h-16 items-center border-b px-3 sm:px-4', collapsed ? 'justify-center' : 'justify-between gap-2')}>
          {!collapsed && <BrandLogo size="sidebar" />}
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={onToggleCollapse}>
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon] ?? LayoutDashboard
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expanded === item.title

              return (
                <li key={item.href}>
                  {hasChildren && !collapsed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : item.title)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive ? 'bg-primary/15 text-primary shadow-[inset_0_0_20px_rgba(249,115,22,0.12)]' : 'hover:bg-sidebar-accent/50',
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.title}
                        </span>
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                      </button>
                      {isExpanded && (
                        <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
                          {item.children!.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                className={cn(
                                  'block rounded-lg px-3 py-2 text-sm transition-colors',
                                  pathname === child.href
                                    ? 'font-medium text-sidebar-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                                )}
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.title : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive ? 'bg-primary/15 text-primary shadow-[inset_0_0_20px_rgba(249,115,22,0.12)]' : 'hover:bg-sidebar-accent/50',
                        collapsed && 'justify-center px-2',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && item.title}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {!collapsed && (
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">Cell Craft ERP v1.0</p>
          </div>
        )}
      </aside>
    </>
  )
}
