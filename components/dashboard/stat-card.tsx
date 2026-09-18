'use client'

import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: number | string
  change?: number
  format?: 'currency' | 'number' | 'text'
  icon: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'info'
  className?: string
}

const variantStyles = {
  default: 'from-cyan-500/15 to-violet-500/10 border-primary/20',
  success: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/20',
  danger: 'from-rose-500/15 to-red-500/10 border-rose-500/20',
  info: 'from-cyan-500/15 to-blue-500/10 border-primary/20',
}

export function StatCard({
  title,
  value,
  change,
  format = 'text',
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const displayValue =
    format === 'currency' && typeof value === 'number'
      ? formatCurrency(value)
      : format === 'number' && typeof value === 'number'
        ? value.toLocaleString()
        : value

  return (
    <Card className={cn('overflow-hidden hover:glow-border animate-slide-up', className)}>
      <CardContent className="p-0">
        <div className={cn('bg-gradient-to-br border-b p-5', variantStyles[variant])}>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{displayValue}</p>
              {change !== undefined && (
                <div className={cn('flex items-center gap-1 text-xs font-medium', change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {formatPercent(change)} vs last month
                </div>
              )}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
