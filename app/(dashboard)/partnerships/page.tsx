'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/providers/toast-provider'
import { formatCurrency } from '@/lib/utils'
import { exportToExcel } from '@/lib/export'
import { PartnershipChart } from '@/components/dashboard/charts'
import type { Partner, Partnership } from '@/types'

export default function PartnershipsPage() {
  const { toast } = useToast()
  const [partnership, setPartnership] = useState<Partnership | null>(null)
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null)

  const fetchPartnership = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partnerships')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load partnership')
      if (data.partnership) {
        setPartnership(data.partnership)
        setPartners(data.partnership.partners)
      } else {
        setPartnership(null)
        setPartners([])
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load partnership', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPartnership()
  }, [fetchPartnership])

  const partnerColumns = [
    { key: 'name', header: 'Partner', sortable: true },
    { key: 'ownershipPercentage', header: 'Ownership', sortable: true, render: (p: Partner) => `${p.ownershipPercentage}%` },
    { key: 'investmentAmount', header: 'Investment', sortable: true, render: (p: Partner) => formatCurrency(p.investmentAmount) },
    { key: 'revenueShare', header: 'Revenue Share', sortable: true, render: (p: Partner) => formatCurrency(p.revenueShare) },
    { key: 'expenseShare', header: 'Expense Share', sortable: true, render: (p: Partner) => formatCurrency(p.expenseShare) },
    { key: 'netProfit', header: 'Net Profit', sortable: true, render: (p: Partner) => <span className="font-bold text-emerald-400">{formatCurrency(p.netProfit)}</span> },
    { key: 'outstandingPayment', header: 'Outstanding', sortable: true, render: (p: Partner) => p.outstandingPayment > 0 ? <span className="text-red-400">{formatCurrency(p.outstandingPayment)}</span> : '—' },
    {
      key: 'actions',
      header: '',
      render: (p: Partner) => (
        <DeleteItemButton
          label={p.name}
          loading={deletingPartnerId === p.id}
          onDelete={async () => {
            setDeletingPartnerId(p.id)
            try {
              const res = await fetch(`/api/partnerships/partners/${p.id}`, { method: 'DELETE' })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error ?? 'Failed to delete partner')
              setPartners((prev) => prev.filter((x) => x.id !== p.id))
              toast('Partner removed')
            } catch (error) {
              toast(error instanceof Error ? error.message : 'Failed to delete partner', 'error')
            } finally {
              setDeletingPartnerId(null)
            }
          }}
        />
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading partnership data...
      </div>
    )
  }

  if (!partnership) {
    return (
      <div className="space-y-6 animate-slide-up">
        <PageHeader title="Partnership Management" description="Manage shared product ownership and profit distribution" />
        <p className="text-center text-muted-foreground py-12">No partnership records found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Partnership Management"
        description="Manage shared product ownership and profit distribution"
        actions={<Button variant="outline" onClick={() => exportToExcel(partners, 'partnership-report')}><Download className="mr-2 h-4 w-4" /> Export</Button>}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{partnership.name}</CardTitle>
          <DeleteItemButton
            label={partnership.name}
            onDelete={async () => {
              try {
                const res = await fetch(`/api/partnerships/${partnership.id}`, { method: 'DELETE' })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error ?? 'Failed to delete partnership')
                setPartnership(null)
                setPartners([])
                toast('Partnership removed')
              } catch (error) {
                toast(error instanceof Error ? error.message : 'Failed to delete partnership', 'error')
              }
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div><p className="text-sm text-muted-foreground">Product</p><p className="font-medium">{partnership.machineName}</p></div>
            <div><p className="text-sm text-muted-foreground">Total Investment</p><p className="font-bold">{formatCurrency(partnership.totalInvestment)}</p></div>
            <div><p className="text-sm text-muted-foreground">Net Profit</p><p className="font-bold text-emerald-400">{formatCurrency(partnership.netProfit)}</p></div>
            <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="font-medium">{formatCurrency(partnership.totalRevenue)}</p></div>
          </div>
        </CardContent>
      </Card>

      <PartnershipChart data={partners.map((p) => ({ name: p.name, value: p.netProfit }))} />
      <DataTable data={partners} columns={partnerColumns} searchKey="name" />
    </div>
  )
}
