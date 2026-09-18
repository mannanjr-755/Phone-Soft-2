'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/page-header'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMachinery } from '@/components/providers/machinery-provider'
import { useToast } from '@/components/providers/toast-provider'
import { getMachineCostSummary, calculateSaleProfit } from '@/lib/machinery/calculations'
import { STATUS_COLORS } from '@/lib/constants/navigation'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { getMachine, deleteMachine, updateMachineCosts, sellMachine } = useMachinery()
  const machine = getMachine(id)

  const [operatingCosts, setOperatingCosts] = useState('0')
  const [salesExpenses, setSalesExpenses] = useState('0')
  const [salePrice, setSalePrice] = useState('')

  useEffect(() => {
    if (machine) {
      setOperatingCosts(String(machine.operatingCosts ?? 0))
      setSalesExpenses(String(machine.salesExpenses ?? 0))
      if (machine.soldPrice) setSalePrice(String(machine.soldPrice))
    }
  }, [machine])

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Product not found</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/machinery')}>
          Back to Products
        </Button>
      </div>
    )
  }

  const opCost = parseFloat(operatingCosts) || 0
  const salesExp = parseFloat(salesExpenses) || 0
  const price = parseFloat(salePrice) || 0
  const costs = getMachineCostSummary({ ...machine, operatingCosts: opCost, salesExpenses: salesExp })
  const salePreview = price > 0 ? calculateSaleProfit(machine, price, opCost, salesExp) : null
  const isSold = machine.status === 'SOLD'

  const handleDelete = async () => {
    try {
      await deleteMachine(id)
      toast('Product deleted')
      router.push('/machinery')
    } catch {
      toast('Failed to delete product', 'error')
    }
  }

  const handleSaveCosts = async () => {
    try {
      await updateMachineCosts(id, opCost, salesExp)
      toast('Costs saved successfully')
    } catch {
      toast('Failed to save costs', 'error')
    }
  }

  const handleRecordSale = async () => {
    if (!price || price <= 0) {
      toast('Enter a valid sale price', 'error')
      return
    }
    try {
      await sellMachine(id, price, opCost, salesExp)
      toast('Sale recorded successfully')
    } catch {
      toast('Failed to record sale', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title={machine.name}
        description={`${machine.brand} ${machine.model} — ${machine.type}`}
        actions={
          <DeleteItemButton
            label={machine.name}
            display="button"
            description={`This will permanently delete "${machine.name}". This action cannot be undone.`}
            onDelete={handleDelete}
          />
        }
      />

      {isSold && machine.saleProfit != null && (
        <Card className="border-violet-500/30 bg-violet-500/5 glow-border">
          <CardContent className="flex flex-wrap items-center gap-6 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Sold For</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(machine.soldPrice ?? 0)}</p>
              <p className="text-xs text-muted-foreground">{machine.soldDate && formatDate(machine.soldDate)}</p>
            </div>
            <div className="h-12 w-px bg-border hidden sm:block" />
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={cn('text-2xl font-bold flex items-center gap-2', machine.saleProfit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {machine.saleProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {formatCurrency(machine.saleProfit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Operating Costs</p>
              <p className="text-xl font-semibold">{formatCurrency(machine.totalOperatingCosts ?? 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-xl font-semibold">{formatCurrency(machine.salesExpenses ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/30 glow-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base glow-text">Sales</CardTitle>
          {!isSold && (
            <DeleteItemButton
              label="sales draft"
              onDelete={() => { setSalePrice(''); setOperatingCosts('0'); setSalesExpenses('0') }}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter sale price, operating costs, and expenses manually to calculate profit.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price (PKR)</Label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                placeholder="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                disabled={isSold}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatingCosts">Operating Costs (PKR)</Label>
              <Input
                id="operatingCosts"
                type="number"
                min="0"
                placeholder="0"
                value={operatingCosts}
                onChange={(e) => setOperatingCosts(e.target.value)}
                disabled={isSold}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesExpenses">Expenses (PKR)</Label>
              <Input
                id="salesExpenses"
                type="number"
                min="0"
                placeholder="0"
                value={salesExpenses}
                onChange={(e) => setSalesExpenses(e.target.value)}
                disabled={isSold}
              />
            </div>
          </div>

          {salePreview && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Purchase Cost</span><span>{formatCurrency(salePreview.purchaseCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Operating Costs</span><span>{formatCurrency(salePreview.operatingCosts)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expenses</span><span>{formatCurrency(salePreview.salesExpenses)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Cost</span><span>{formatCurrency(salePreview.totalCost)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Net Profit</span>
                <span className={salePreview.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatCurrency(salePreview.profit)}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Margin</span><span>{salePreview.margin.toFixed(1)}%</span></div>
            </div>
          )}

          {!isSold && (
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleSaveCosts}>Save Costs</Button>
              <Button onClick={handleRecordSale} disabled={!salePreview}>Record Sale</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Product Details</CardTitle>
            <DeleteItemButton label={machine.name} onDelete={handleDelete} />
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['Serial Number', machine.serialNumber],
                ['Registration', machine.registrationNumber ?? 'N/A'],
                ['Purchase Date', formatDate(machine.purchaseDate)],
                ['Purchase Cost', formatCurrency(machine.purchaseCost)],
                ['Current Value', isSold ? 'Sold' : formatCurrency(machine.currentValue)],
                ['Depreciation', `${machine.depreciationRate}%`],
                ['Working Hours', machine.workingHours.toLocaleString()],
                ['Location', machine.location ?? 'N/A'],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd><Badge className={cn('border-0 mt-1', STATUS_COLORS[machine.status])}>{machine.status}</Badge></dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Cost Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Purchase Cost</span><span>{formatCurrency(costs.purchaseCost)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Operating Costs</span><span>{formatCurrency(costs.operatingCosts)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Expenses</span><span>{formatCurrency(costs.salesExpenses)}</span></div>
            <div className="flex justify-between border-t border-border pt-2"><span className="text-sm font-medium">Total Cost</span><span className="font-bold">{formatCurrency(costs.totalCost)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Cost / Month</span><span>{formatCurrency(costs.costPerMonth)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Cost / Hour</span><span>{formatCurrency(costs.costPerWorkingHour)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
