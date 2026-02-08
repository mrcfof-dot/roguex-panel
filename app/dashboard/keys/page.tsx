'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { KeysTable } from '@/components/keys-table'
import { CreateKeyDialog } from '@/components/create-key-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter } from 'lucide-react'
import type { LicenseKey } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function KeysPage() {
  const { data: keys, error, isLoading, mutate } = useSWR<LicenseKey[]>('/api/keys', fetcher)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)

  const handleCreated = useCallback(() => {
    mutate()
    setShowCreate(false)
  }, [mutate])

  const filteredKeys = (Array.isArray(keys) ? keys : []).filter((key) => {
    const now = new Date()
    const isExpired = new Date(key.expires_at) <= now
    const effectiveStatus = key.status === 'banned' ? 'banned' : isExpired ? 'expired' : 'active'

    if (statusFilter !== 'all' && effectiveStatus !== statusFilter) return false
    if (search) {
      const term = search.toLowerCase()
      return (
        key.key.toLowerCase().includes(term) ||
        key.label?.toLowerCase().includes(term) ||
        key.discord_id?.toLowerCase().includes(term)
      )
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage your license keys
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create License
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search keys, labels, or Discord ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-secondary pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full border-border bg-secondary text-foreground sm:w-44">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-card">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load keys: {error.message || 'Unknown error'}
        </div>
      )}

      <KeysTable keys={filteredKeys} isLoading={isLoading} onMutate={mutate} />

      <CreateKeyDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleCreated}
      />
    </div>
  )
}
