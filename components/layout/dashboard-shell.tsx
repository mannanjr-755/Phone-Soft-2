'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { TopNavbar } from './top-navbar'

interface DashboardShellProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
}

export function DashboardShell({ children, userName, userRole }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="relative min-h-screen bg-background dashboard-grid-bg">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      </div>
      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <TopNavbar
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          userRole={userRole}
        />
        <main className="relative p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
