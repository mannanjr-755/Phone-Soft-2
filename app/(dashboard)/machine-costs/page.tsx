'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useMachinery } from '@/components/providers/machinery-provider'
import { useToast } from '@/components/providers/toast-provider'
import { getMachineCostSummary } from '@/lib/machinery/calculations'
import { formatCurrency } from '@/lib/utils'

export default function MachineCostsPage() {
  const { machines, updateMachineCosts } = useMachinery()
  const { toast } = useToast()
  const [selectedId, setSelectedId] = useState(machines[0]?.id ?? '')
  const [operatingCosts, setOperatingCosts] = useState('0')
  const [salesExpenses, setSalesExpenses] = useState('0')

  const machine = machines.find((m) => m.id === selectedId)

  useEffect(() => {
    if (machine) {
      setOperatingCosts(String(machine.operatingCosts ?? 0))
      setSalesExpenses(String(machine.salesExpenses ?? 0))
    }
  }, [machine])

  const opCost = parseFloat(operatingCosts) || 0
  const salesExp = parseFloat(salesExpenses) || 0
  const costs = machine
    ? getMachineCostSummary({ ...machine, operatingCosts: opCost, salesExpenses: salesExp })
    : null

  const handleSave = async () => {
    if (!selectedId) return
    try {
      await updateMachineCosts(selectedId, opCost, salesExp)
      toast('Costs updated successfully')
    } catch {
      toast('Failed to update costs', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Product Cost Tracking" description="Enter operating costs and expenses manually per product" />

      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="max-w-sm"><SelectValue placeholder="Select product" /></SelectTrigger>
        <SelectContent>
          {machines.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {machine && costs && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Enter Costs — {machine.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="mc-operating">Operating Costs (PKR)</Label>
                  <Input
                    id="mc-operating"
                    type="number"
                    min="0"
                    value={operatingCosts}
                    onChange={(e) => setOperatingCosts(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mc-expenses">Expenses (PKR)</Label>
                  <Input
                    id="mc-expenses"
                    type="number"
                    min="0"
                    value={salesExpenses}
                    onChange={(e) => setSalesExpenses(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSave}>Save Costs</Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Product Cost</p><p className="text-2xl font-bold">{formatCurrency(costs.totalCost)}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Cost Per Month</p><p className="text-2xl font-bold">{formatCurrency(costs.costPerMonth)}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Cost Per Working Hour</p><p className="text-2xl font-bold">{formatCurrency(costs.costPerWorkingHour)}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Cost Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-sm">Purchase Cost</span><span className="font-medium">{formatCurrency(costs.purchaseCost)}</span></div>
              <div className="flex justify-between"><span className="text-sm">Operating Costs</span><span className="font-medium">{formatCurrency(costs.operatingCosts)}</span></div>
              <div className="flex justify-between"><span className="text-sm">Expenses</span><span className="font-medium">{formatCurrency(costs.salesExpenses)}</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className="font-medium">Total</span><span className="font-bold">{formatCurrency(costs.totalCost)}</span></div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
