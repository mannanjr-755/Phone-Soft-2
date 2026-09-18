'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DataTable } from '@/components/dashboard/data-table'
import { DeleteItemButton } from '@/components/dashboard/delete-item-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'
import { Plus, Loader2 } from 'lucide-react'
import type { User } from '@/types'

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  ACCOUNTANT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  YARD_MANAGER: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  OPERATOR: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  PARTNER: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load users')
      setUsers(data.users)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'username', header: 'Username', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', sortable: true, render: (u: User) => (
      <Badge className={`border-0 ${ROLE_COLORS[u.role]}`}>{u.role.replace('_', ' ')}</Badge>
    )},
    { key: 'active', header: 'Status', sortable: true, render: (u: User) => (
      <Badge className={u.active ? 'bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 border-0'}>
        {u.active ? 'Active' : 'Inactive'}
      </Badge>
    )},
    {
      key: 'actions',
      header: '',
      render: (u: User) => (
        <DeleteItemButton
          label={u.name}
          loading={deletingId === u.id}
          onDelete={async () => {
            setDeletingId(u.id)
            try {
              const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error ?? 'Failed to delete user')
              setUsers((prev) => prev.filter((x) => x.id !== u.id))
              toast('User deleted')
            } catch (error) {
              toast(error instanceof Error ? error.message : 'Failed to delete user', 'error')
            } finally {
              setDeletingId(null)
            }
          }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Users & Roles"
        description="Manage user accounts and role-based permissions"
        actions={<Button><Plus className="mr-2 h-4 w-4" /> Add User</Button>}
      />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading users...
        </div>
      ) : (
        <DataTable data={users} columns={columns} searchKey="name" searchPlaceholder="Search users..." />
      )}
    </div>
  )
}
