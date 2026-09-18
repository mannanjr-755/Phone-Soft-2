'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Printer } from 'lucide-react'
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type PurchaseRecord = {
  id: string
  name: string
  qty: number
  price: number
  createdAt?: string
}

const SHOP_NAME = 'Cell Craft'
const SHOP_ADDRESS = 'Main Market, Gulberg, Lahore'
const SHOP_PHONE = '+92 300 1234567'
const SUPPLIER = 'Walk-in Supplier'
const PAYMENT_METHOD = 'Cash'
const RECEIVED_BY = 'Admin'

const BARCODE_PATTERN =
  'repeating-linear-gradient(90deg, #000 0 1px, #fff 1px 3px, #000 3px 4px, #fff 4px 5px, #000 5px 7px, #fff 7px 8px, #000 8px 9px, #fff 9px 12px)'

const PRINT_STYLES = `
@media print {
  @page { margin: 2mm; }
  body * { visibility: hidden; }
  #purchase-receipt-paper, #purchase-receipt-paper * { visibility: visible; }
  #purchase-receipt-paper {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    margin: 0 auto !important;
    width: 80mm !important;
    max-width: 80mm !important;
    max-height: none !important;
    overflow: visible !important;
    transform: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    background: white !important;
    color: black !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .purchase-receipt-overlay, .no-print { display: none !important; }
}
`

function purchaseTimestamp(id: string): number {
  const digits = id.replace(/\D/g, '')
  const ts = Number(digits)
  return Number.isFinite(ts) && ts > 0 ? ts : Date.now()
}

function purchaseNumber(id: string): string {
  const digits = id.replace(/\D/g, '')
  return digits ? `#${digits.slice(-6).padStart(6, '0')}` : '#000001'
}

function formatDateDDMMYYYY(ts: number): string {
  const d = new Date(ts)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  let hours = d.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
}

function DashedDivider({ bold = false }: { bold?: boolean }) {
  return (
    <div className={cn('my-3 border-black', bold ? 'border-t-2 border-solid' : 'border-t border-dashed')} />
  )
}

export function PurchaseReceiptModal({
  purchase,
  onClose,
}: {
  purchase: PurchaseRecord
  onClose: () => void
}) {
  const ts = purchase.createdAt ? new Date(purchase.createdAt).getTime() : purchaseTimestamp(purchase.id)
  const receiptNo = purchaseNumber(purchase.id)
  const dateStr = formatDateDDMMYYYY(ts)
  const timeStr = formatTime(ts)
  const subtotal = purchase.qty * purchase.price
  const discount = 0
  const tax = 0
  const total = subtotal - discount + tax

  return (
    <>
      <style>{PRINT_STYLES}</style>
      <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
        <DialogPortal>
          <DialogOverlay className="purchase-receipt-overlay" />
          <DialogPrimitive.Content
            id="purchase-receipt-paper"
            className={cn(
              'fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[80mm] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-md bg-white font-mono text-[12px] leading-snug text-black shadow-2xl',
            )}
          >
            <DialogTitle className="sr-only">Purchase Receipt</DialogTitle>

            <div className="p-5">
              <div className="text-center">
                <p className="text-base font-bold uppercase tracking-widest">{SHOP_NAME}</p>
                <p className="mt-1 text-[11px]">{SHOP_ADDRESS}</p>
                <p className="text-[11px]">{SHOP_PHONE}</p>
              </div>

              <DashedDivider />
              <p className="text-center text-[13px] font-bold tracking-[0.25em]">PURCHASE RECEIPT</p>
              <DashedDivider />

              <div className="space-y-0.5">
                <p>Purchase No: {receiptNo}</p>
                <p>Date: {dateStr}</p>
                <p>Time: {timeStr}</p>
                <p>Supplier: {SUPPLIER}</p>
              </div>

              <DashedDivider />

              <div className="flex text-[11px] font-bold uppercase">
                <span className="flex-1">Description</span>
                <span className="w-10 text-right">Qty</span>
                <span className="w-14 text-right">Price</span>
              </div>
              <div className="mt-1.5 border-t border-dashed border-black" />

              <div className="flex py-1">
                <span className="flex-1 break-words pr-2">{purchase.name}</span>
                <span className="w-10 text-right">{purchase.qty}</span>
                <span className="w-14 text-right">{purchase.price}</span>
              </div>

              <DashedDivider />

              <div className="space-y-0.5">
                <div className="flex items-center">
                  <span className="flex-1">Subtotal:</span>
                  <span className="w-20 text-right">{subtotal}</span>
                </div>
                <div className="flex items-center">
                  <span className="flex-1">Discount:</span>
                  <span className="w-20 text-right">-{discount}</span>
                </div>
                <div className="flex items-center">
                  <span className="flex-1">Tax:</span>
                  <span className="w-20 text-right">{tax}</span>
                </div>
              </div>

              <DashedDivider bold />

              <div className="flex items-center">
                <span className="flex-1 text-base font-bold">TOTAL:</span>
                <span className="w-24 text-right text-base font-bold">{total}</span>
              </div>

              <DashedDivider bold />

              <div className="space-y-0.5">
                <p>Payment Method:</p>
                <p className="ml-4">{PAYMENT_METHOD}</p>
                <p className="mt-1">Received By:</p>
                <p className="ml-4">{RECEIVED_BY}</p>
              </div>

              <DashedDivider />

              <p className="text-center text-[11px] font-bold tracking-[0.15em]">
                THANK YOU FOR YOUR PURCHASE
              </p>

              <DashedDivider />

              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-40" style={{ backgroundImage: BARCODE_PATTERN }} />
                <p className="text-[10px] tracking-[0.25em]">{receiptNo}</p>
              </div>
            </div>

            <div className="no-print flex items-center justify-center gap-2 border-t border-gray-200 p-3">
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  )
}
