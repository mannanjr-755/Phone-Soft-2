'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'
import { cn } from '@/lib/utils'

interface DeleteItemButtonProps {
  label: string
  onDelete: () => void | Promise<void>
  loading?: boolean
  className?: string
  display?: 'icon' | 'button'
  buttonText?: string
  description?: string
}

export function DeleteItemButton({
  label,
  onDelete,
  loading,
  className,
  display = 'icon',
  buttonText = 'Delete',
  description,
}: DeleteItemButtonProps) {
  const [open, setOpen] = useState(false)

  const dialogDescription =
    description ?? `Are you sure you want to delete "${label}"? This action cannot be undone.`

  const handleConfirm = async () => {
    await onDelete()
    setOpen(false)
  }

  return (
    <>
      {display === 'button' ? (
        <Button
          type="button"
          variant="destructive"
          className={className}
          onClick={() => setOpen(true)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          {buttonText}
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive',
            className,
          )}
          onClick={() => setOpen(true)}
          disabled={loading}
          aria-label={`Delete ${label}`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      )}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete ${label}?`}
        description={dialogDescription}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  )
}
