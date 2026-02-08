'use client'

import React from "react"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function CreateKeyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [label, setLabel] = useState('')
  const [discordId, setDiscordId] = useState('')
  const [expiryDays, setExpiryDays] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        key: discordId.trim() || undefined,
        label: label || null,
        discord_id: discordId || null,
        max_devices: 1,
        validity: expiryDays || '30d',
        notes: notes || null,
      }

      // Manual fetch call to handle non-200 responses better
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const text = await response.text()
        let data
        try {
          data = JSON.parse(text)
        } catch {
          throw new Error(`Server Error: ${response.status} ${response.statusText}`)
        }
        if (response.status === 409) {
          throw new Error(data.message || 'Esta Key ja Existe')
        }
        throw new Error(data.message || 'Failed to create key')
      }

      toast.success('Key created successfully!')

      // Reset form
      setLabel('')
      setDiscordId('')
      setExpiryDays('')
      setNotes('')
      onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error creating key')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New License</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure license parameters
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Name User</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="border-border bg-secondary text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Discord ID</Label>
              <Input
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="Ex: 123456789012345678"
                className="border-border bg-secondary text-foreground"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Validity (Ex: 1d, 10s, lifetime)</Label>
              <Input
                type="text"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                placeholder="Ex: 1d or 30s"
                className="border-border bg-secondary text-foreground"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Key
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segment = () =>
    Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `ROGUEX-${segment()}-${segment()}-${segment()}-${segment()}`
}
