'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Machine } from '@/types'
import type { MachineFormData } from '@/lib/validations/schemas'
import { useToast } from '@/components/providers/toast-provider'

interface MachineryContextValue {
  machines: Machine[]
  loading: boolean
  error: string | null
  refreshMachines: () => Promise<Machine[]>
  addMachine: (data: MachineFormData) => Promise<Machine>
  deleteMachine: (id: string) => Promise<void>
  updateMachineCosts: (id: string, operatingCosts: number, salesExpenses: number) => Promise<Machine>
  sellMachine: (id: string, salePrice: number, operatingCosts: number, salesExpenses: number) => Promise<Machine | null>
  getMachine: (id: string) => Machine | undefined
}

const MachineryContext = createContext<MachineryContextValue | null>(null)

export function MachineryProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshMachines = useCallback(async (): Promise<Machine[]> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/machines', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load machines')
      setMachines(data.machines)
      return data.machines as Machine[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load machines'
      setError(message)
      setMachines([])
      toast(message, 'error')
      return []
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    refreshMachines()
  }, [refreshMachines])

  const addMachine = useCallback(async (data: MachineFormData): Promise<Machine> => {
    const res = await fetch('/api/machines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error ?? 'Failed to create machine')
    setMachines((prev) => [result.machine, ...prev])
    return result.machine
  }, [])

  const deleteMachine = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/machines/${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error ?? 'Failed to delete machine')
    await refreshMachines()
  }, [refreshMachines])

  const updateMachineCosts = useCallback(
    async (id: string, operatingCosts: number, salesExpenses: number): Promise<Machine> => {
      const res = await fetch(`/api/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCosts', operatingCosts, salesExpenses }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Failed to update costs')
      setMachines((prev) => prev.map((m) => (m.id === id ? result.machine : m)))
      return result.machine
    },
    [],
  )

  const sellMachine = useCallback(
    async (
      id: string,
      salePrice: number,
      operatingCosts: number,
      salesExpenses: number,
    ): Promise<Machine | null> => {
      const res = await fetch(`/api/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recordSale', salePrice, operatingCosts, salesExpenses }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Failed to record sale')
      setMachines((prev) => prev.map((m) => (m.id === id ? result.machine : m)))
      return result.machine
    },
    [],
  )

  const getMachine = useCallback((id: string) => machines.find((m) => m.id === id), [machines])

  const value = useMemo(
    () => ({
      machines,
      loading,
      error,
      refreshMachines,
      addMachine,
      deleteMachine,
      updateMachineCosts,
      sellMachine,
      getMachine,
    }),
    [machines, loading, error, refreshMachines, addMachine, deleteMachine, updateMachineCosts, sellMachine, getMachine],
  )

  return <MachineryContext.Provider value={value}>{children}</MachineryContext.Provider>
}

export function useMachinery() {
  const ctx = useContext(MachineryContext)
  if (!ctx) throw new Error('useMachinery must be used within MachineryProvider')
  return ctx
}
