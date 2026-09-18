'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { machineSchema, type MachineFormData } from '@/lib/validations/schemas'
import { useMachinery } from '@/components/providers/machinery-provider'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/providers/toast-provider'

export default function NewMachinePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addMachine } = useMachinery()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
    defaultValues: { status: 'ACTIVE', depreciationRate: 10, workingHours: 0 },
  })

  const onSubmit = async (data: MachineFormData) => {
    try {
      const machine = await addMachine(data)
      router.push(`/machinery/${machine.id}`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to save product', 'error')
    }
  }

  const fields: { name: keyof MachineFormData; label: string; type?: string }[] = [
    { name: 'name', label: 'Product Name' },
    { name: 'type', label: 'Product Type' },
    { name: 'brand', label: 'Brand' },
    { name: 'model', label: 'Model' },
    { name: 'serialNumber', label: 'Serial Number' },
    { name: 'registrationNumber', label: 'Registration Number' },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
    { name: 'purchaseCost', label: 'Purchase Cost', type: 'number' },
    { name: 'currentValue', label: 'Current Value', type: 'number' },
    { name: 'depreciationRate', label: 'Depreciation Rate (%)', type: 'number' },
    { name: 'workingHours', label: 'Working Hours', type: 'number' },
    { name: 'location', label: 'Location' },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Add Product" description="Register a new mobile phone or stock product" />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input id={f.name} type={f.type ?? 'text'} {...register(f.name)} />
                {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]?.message}</p>}
              </div>
            ))}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue="ACTIVE" onValueChange={(v) => setValue('status', v as MachineFormData['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['ACTIVE', 'IDLE', 'MAINTENANCE', 'PARTNERSHIP', 'RETIRED'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Product'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
