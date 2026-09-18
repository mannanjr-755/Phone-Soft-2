'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899']

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface CashFlowChartProps {
  data: { name: string; revenue?: number; expenses?: number; profit?: number }[]
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ChartCard title="Monthly Cash Flow" description="Revenue, expenses, and profit trends">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Area type="monotone" dataKey="revenue" stroke="#059669" fill="url(#colorRevenue)" name="Revenue" />
          <Area type="monotone" dataKey="expenses" stroke="#dc2626" fill="url(#colorExpenses)" name="Expenses" />
          <Line type="monotone" dataKey="profit" stroke="#1e3a5f" strokeWidth={2} dot={false} name="Profit" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface ExpenseBreakdownChartProps {
  data: { name: string; value?: number }[]
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  return (
    <ChartCard title="Expense Breakdown" description="Distribution by category">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface UtilizationChartProps {
  data: { name: string; value?: number }[]
}

export function UtilizationChart({ data }: UtilizationChartProps) {
  return (
    <ChartCard title="Product Utilization" description="Utilization rate by product (%)">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis type="number" domain={[0, 100]} className="text-xs" />
          <YAxis type="category" dataKey="name" width={100} className="text-xs" />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="value" fill="#1e3a5f" radius={[0, 4, 4, 0]} name="Utilization %" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface RevenueExpensesChartProps {
  data: { name: string; revenue?: number; expenses?: number }[]
}

export function RevenueExpensesChart({ data }: RevenueExpensesChartProps) {
  return (
    <ChartCard title="Revenue vs Expenses" description="Comparative monthly analysis">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} name="Revenue" />
          <Bar dataKey="expenses" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface ProfitTrendChartProps {
  data: { name: string; profit?: number }[]
}

export function ProfitTrendChart({ data }: ProfitTrendChartProps) {
  return (
    <ChartCard title="Monthly Profit Trend">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} name="Profit" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface PartnershipChartProps {
  data: { name: string; value?: number }[]
}

export function PartnershipChart({ data }: PartnershipChartProps) {
  return (
    <ChartCard title="Partnership Profit Distribution">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
