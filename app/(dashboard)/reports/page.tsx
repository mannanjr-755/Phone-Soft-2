'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/providers/toast-provider'
import { REPORT_PERIODS } from '@/lib/data/mock-data'
import { REPORT_TYPES } from '@/lib/constants/reports'
import { exportToExcel, exportToPDF } from '@/lib/export'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ReportsPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState('Monthly')
  const [reportType, setReportType] = useState<string>(REPORT_TYPES[0])
  const [reportTypes, setReportTypes] = useState<string[]>([...REPORT_TYPES])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?type=${encodeURIComponent(reportType)}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load report')
      setRows(data.rows ?? [])
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load report', 'error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [reportType, toast])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleExportExcel = () => {
    if (rows.length === 0) {
      toast('No data to export', 'error')
      return
    }
    const slug = reportType.toLowerCase().replace(/\s+/g, '-')
    exportToExcel(rows, `${period.toLowerCase()}-${slug}`)
    toast('Report exported to Excel')
  }

  const handleExportPDF = () => {
    if (rows.length === 0) {
      toast('No data to export', 'error')
      return
    }
    const html = `
      <h2>${period} — ${reportType}</h2>
      <p>${rows.length} record(s)</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
        <thead><tr>${Object.keys(rows[0]).map((k) => `<th>${k}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${Object.values(row).map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `
    exportToPDF(`${period} ${reportType}`, html)
    toast('Report exported to PDF')
  }

  const handleDeleteReport = (name: string) => {
    setReportTypes((prev) => {
      const next = prev.filter((r) => r !== name)
      if (reportType === name && next.length > 0) {
        setReportType(next[0])
      }
      return next
    })
    toast(`Report "${name}" removed from list`)
  }

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading report data...
        </div>
      )
    }

    if (rows.length === 0) {
      return (
        <p className="py-12 text-center text-muted-foreground">
          No data for this report yet. Add entries in the relevant module to populate it.
        </p>
      )
    }

    if (reportType === 'Product Profit Report') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Product / Item</th>
                <th className="py-2 text-right">Purchase Cost</th>
                <th className="py-2 text-right">Operating Cost</th>
                <th className="py-2 text-right">Selling Price</th>
                <th className="py-2 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-b">
                  <td className="py-2">{String(row.itemName)}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(row.purchaseCost))}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(row.machineCost))}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(row.sellingPrice))}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(Number(row.profit))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (reportType === 'Expense Report' || reportType === 'Maintenance Report') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Category</th>
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-b">
                  <td className="py-2">{formatDate(String(row.date))}</td>
                  <td className="py-2">{String(row.category).replace(/_/g, ' ')}</td>
                  <td className="py-2">{String(row.description)}</td>
                  <td className="py-2 text-right text-red-500">{formatCurrency(Number(row.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (reportType === 'Partnership Report') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Partnership</th>
                <th className="py-2 text-left">Product</th>
                <th className="py-2 text-right">Investment</th>
                <th className="py-2 text-right">Revenue</th>
                <th className="py-2 text-right">Net Profit</th>
                <th className="py-2 text-right">Partners</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-b">
                  <td className="py-2">{String(row.name)}</td>
                  <td className="py-2">{String(row.machineName)}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(row.totalInvestment))}</td>
                  <td className="py-2 text-right">{formatCurrency(Number(row.totalRevenue))}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(Number(row.netProfit))}</td>
                  <td className="py-2 text-right">{Number(row.partnerCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export business reports" />

      <Card>
        <CardHeader><CardTitle className="text-base">Generate Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {reportTypes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExportExcel} disabled={rows.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF} disabled={rows.length === 0}>
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{reportType} Preview</CardTitle>
        </CardHeader>
        <CardContent>{renderPreview()}</CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((r) => (
          <Card key={r} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <FileText className="h-8 w-8 shrink-0 text-brand-900 dark:text-brand-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r}</p>
                <p className="text-xs text-muted-foreground">
                  {reportType === r ? `${rows.length} record(s)` : 'Select to preview'}
                </p>
              </div>
              <DeleteItemButton label={r} onDelete={() => handleDeleteReport(r)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
