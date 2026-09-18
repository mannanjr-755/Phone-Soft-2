 'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [company, setCompany] = useState('Cell Craft')
  const [contact, setContact] = useState('admin@cellcraft.com')

  const save = () => {
    // simple client-side save (could call API)
    alert('Settings saved')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Application settings and branding" />
      <Card>
        <CardContent>
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div>
            <Button onClick={save}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
