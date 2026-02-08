'use client'

import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { formatDate, getDaysRemaining } from '@/lib/keys'
import type { LicenseKey, HWID, AuthLog } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Copy,
  Ban,
  CheckCircle,
  RotateCcw,
  Trash2,
  Monitor,
  Loader2,
  Save,
  MessageSquare,
  Clock,
  Hash,
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface KeyDetail {
  key: LicenseKey
  hwids: HWID[]
  logs: AuthLog[]
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to load')
  return res.json()
})

export default function KeyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data, isLoading, error, mutate } = useSWR<KeyDetail>(
    id ? `/api/keys/${id}` : null,
    fetcher
  )

  const [editMaxDevices, setEditMaxDevices] = useState('')
  const [editExpiryDays, setEditExpiryDays] = useState('')
  const [editDiscordId, setEditDiscordId] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 p-12">
        <p className="text-sm text-destructive">Key not found</p>
        <Button variant="ghost" onClick={() => router.push('/dashboard/keys')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    )
  }

  const { key, hwids, logs } = data
  const daysLeft = getDaysRemaining(key.expires_at)
  const isExpired = new Date(key.expires_at) <= new Date()
  const effectiveStatus = key.status === 'banned' ? 'banned' : isExpired ? 'expired' : 'active'

  const statusConfig = {
    active: { label: 'Active', className: 'border-success/30 bg-success/10 text-success' },
    expired: { label: 'Expired', className: 'border-warning/30 bg-warning/10 text-warning' },
    banned: { label: 'Banned', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
  }

  const copyKey = () => {
    navigator.clipboard.writeText(key.key)
    toast.success('Key copied!')
  }

  const handleBanToggle = async () => {
    const newStatus = key.status === 'banned' ? 'active' : 'banned'
    try {
      await fetch(`/api/keys/${key.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      toast.success(newStatus === 'banned' ? 'Key banned!' : 'Key activated!')
      mutate()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleResetHWIDs = async () => {
    try {
      await fetch(`/api/keys/${key.id}/hwids`, { method: 'DELETE' })
      toast.success('HWIDs reset!')
      mutate()
    } catch (error) {
      toast.error('Failed to reset HWIDs')
    }
  }

  const handleDeleteKey = async () => {
    try {
      await fetch(`/api/keys/${key.id}`, { method: 'DELETE' })
      toast.success('Key deleted!')
      router.push('/dashboard/keys')
    } catch (error) {
      toast.error('Failed to delete key')
    }
  }

  const handleRemoveHWID = async (hwidId: string) => {
    try {
      await fetch(`/api/hwids/${hwidId}`, { method: 'DELETE' })
      toast.success('HWID removed!')
      mutate()
    } catch (error) {
      toast.error('Failed to remove HWID')
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const updates: Record<string, unknown> = {}

      if (editMaxDevices) updates.max_devices = Math.max(Number.parseInt(editMaxDevices) || 1, 1)
      if (editExpiryDays) {
        const days = Math.max(Number.parseInt(editExpiryDays) || 0, 1)
        updates.expires_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      }
      if (editDiscordId !== undefined && editDiscordId !== '') updates.discord_id = editDiscordId
      if (editLabel !== undefined && editLabel !== '') updates.label = editLabel

      if (Object.keys(updates).length === 0) {
        toast.error('No changes to save')
        return
      }

      const res = await fetch(`/api/keys/${key.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Update failed')

      toast.success('Changes saved!')
      setEditMaxDevices('')
      setEditExpiryDays('')
      setEditDiscordId('')
      setEditLabel('')
      mutate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/keys')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Key Details
            </h1>
            <p className="text-sm text-muted-foreground">{key.label ?? 'No Label'}</p>
          </div>
        </div>
        <Badge variant="outline" className={statusConfig[effectiveStatus].className}>
          {statusConfig[effectiveStatus].label}
        </Badge>
      </div>

      {/* Key Info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <code className="flex-1 rounded-lg bg-secondary px-4 py-2.5 font-mono text-sm text-foreground">
            {key.key}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyKey}
            className="text-muted-foreground hover:text-primary"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Created</span>
            <span className="text-sm text-foreground">{formatDate(key.created_at)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Expires</span>
            <span className="text-sm text-foreground">{formatDate(key.expires_at)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Days Left</span>
            <span className={`text-sm font-semibold ${daysLeft <= 0 ? 'text-destructive' : daysLeft <= 7 ? 'text-warning' : 'text-success'}`}>
              {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Devices</span>
            <span className="text-sm text-foreground">
              {hwids.length}/{key.max_devices}
            </span>
          </div>
        </div>

        {key.discord_id && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary p-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Discord ID:</span>
            <code className="font-mono text-sm text-foreground">{key.discord_id}</code>
          </div>
        )}

        {key.notes && (
          <div className="mt-3 rounded-lg bg-secondary p-3">
            <span className="text-xs text-muted-foreground">Notes:</span>
            <p className="mt-1 text-sm text-foreground">{key.notes}</p>
          </div>
        )}
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="border-border bg-transparent text-foreground hover:bg-secondary"
          onClick={handleBanToggle}
        >
          {key.status === 'banned' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-success" />
              Activate
            </>
          ) : (
            <>
              <Ban className="mr-2 h-4 w-4 text-destructive" />
              Ban
            </>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-border bg-transparent text-foreground hover:bg-secondary">
              <RotateCcw className="mr-2 h-4 w-4 text-primary" />
              Reset HWIDs
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-border bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Reset HWIDs?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                All {hwids.length} linked devices will be removed. The key can be used on new devices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border bg-secondary text-foreground hover:bg-muted">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetHWIDs} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Key
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-border bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Delete Key?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border bg-secondary text-foreground hover:bg-muted">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteKey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Edit Section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Edit Key</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              Label
            </Label>
            <Input
              placeholder={key.label ?? 'No Label'}
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" />
              Max Devices
            </Label>
            <Input
              type="number"
              min={1}
              placeholder={String(key.max_devices)}
              value={editMaxDevices}
              onChange={(e) => setEditMaxDevices(e.target.value)}
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Validity (days from now)
            </Label>
            <Input
              type="number"
              min={1}
              placeholder="30"
              value={editExpiryDays}
              onChange={(e) => setEditExpiryDays(e.target.value)}
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Discord ID
            </Label>
            <Input
              placeholder={key.discord_id ?? 'None'}
              value={editDiscordId}
              onChange={(e) => setEditDiscordId(e.target.value)}
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {/* HWIDs Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">
            Linked Devices ({hwids.length}/{key.max_devices})
          </h2>
        </div>
        {hwids.length === 0 ? (
          <div className="p-8 text-center">
            <Monitor className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No devices linked</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {hwids.map((h) => (
              <div key={h.id} className="flex items-center gap-4 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Monitor className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <code className="block truncate font-mono text-sm text-foreground">{h.hwid}</code>
                  <p className="text-xs text-muted-foreground">
                    {h.ip_address && `IP: ${h.ip_address} | `}
                    Registered: {formatDate(h.registered_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveHWID(h.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Logs for this key */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold text-foreground">Key History</h2>
          </div>
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{log.event_type}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {log.ip_address && `IP: ${log.ip_address}`}
                    {log.hwid && ` | HWID: ${log.hwid.slice(0, 16)}...`}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
