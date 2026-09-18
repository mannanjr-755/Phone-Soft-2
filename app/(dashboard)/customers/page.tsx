'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type CustomerRow = {
  id: string
  name: string
  phone: string
}

export default function CustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<CustomerRow | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load customers')
      setRows(data.customers ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load customers')
    } finally {
      setLoading(false)
      setReady(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    try {
      const res = await fetch(editing ? `/api/customers/${editing.id}` : '/api/customers', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save customer')
      await load()
      setName('')
      setPhone('')
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save customer')
    }
  }

  const del = async (id: string) => {
    setError('')
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to delete customer')
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete customer')
    }
  }

  const edit = (r: CustomerRow) => { setEditing(r); setName(r.name); setPhone(r.phone) }

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage customer records for phones & accessories" />
      <Card>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button onClick={save}>{editing ? 'Update' : 'Add'}</Button>
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {!ready ? null : (
            <table className="w-full table-auto">
              <thead><tr className="text-left"><th>Name</th><th>Phone</th><th>Actions</th></tr></thead>
              <tbody>
                {loading && rows.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-sm text-muted-foreground">Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-sm text-muted-foreground">No customers yet. Add your first customer above.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.name}</td>
                      <td>{r.phone}</td>
                      <td className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => edit(r)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => del(r.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
