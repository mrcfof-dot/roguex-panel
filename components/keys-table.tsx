'use client'

import type { LicenseKey } from '@/lib/types'
import { getDaysRemaining, formatDate, formatDuration } from '@/lib/keys'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Copy, Loader2, MoreHorizontal, RotateCcw, Ban, Link2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useState } from 'react'

function StatusBadge({ licenseKey }: { licenseKey: LicenseKey }) {
  const now = new Date()
  const isExpired = licenseKey.expires_at ? new Date(licenseKey.expires_at) <= now : false
  // Logic: Banned -> Banned, Expired -> Expired, Active + HWID -> ON, Active + No HWID -> OFF, Pure Active -> Pending
  let status: 'on' | 'off' | 'expired' | 'banned' | 'pending' = 'pending'

  if (licenseKey.status === 'banned') {
    status = 'banned'
  } else if (isExpired) {
    status = 'expired'
  } else if (!licenseKey.expires_at) {
    status = 'pending'
  } else if (licenseKey.status === 'active') {
    status = licenseKey.hwid ? 'on' : 'off'
  }

  const config = {
    on: { label: 'ON', className: 'text-green-500', dot: 'bg-green-500' },
    off: { label: 'OFF', className: 'text-neutral-500', dot: 'bg-neutral-500' },
    expired: { label: 'Expirada', className: 'text-warning', dot: 'bg-warning' },
    banned: { label: 'Banida', className: 'text-destructive', dot: 'bg-destructive' },
    pending: { label: 'Aguardando Ativação', className: 'text-blue-500', dot: 'bg-blue-500' },
  }

  const c = config[status]
  return (
    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${c.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} ${status === 'on' ? 'animate-pulse' : ''}`} />
      {c.label}
    </div>
  )
}

export function KeysTable({
  keys,
  isLoading,
  onMutate,
}: {
  keys: LicenseKey[]
  isLoading: boolean
  onMutate: () => void
}) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Key copiada!')
  }

  const handleResetHWID = async (id: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/keys/${id}/hwids`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Reset failed')
      toast.success('HWID resetado com sucesso!')
      onMutate()
    } catch (err) {
      toast.error('Erro ao resetar HWID')
    } finally {
      setProcessingId(null)
    }
  }

  const handleBanUser = async (id: string, currentStatus: string) => {
    if (currentStatus === 'banned') return
    setProcessingId(id)
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'banned' }),
      })
      if (!res.ok) throw new Error('Ban failed')
      toast.success('Usuário banido!')
      onMutate()
    } catch (err) {
      toast.error('Erro ao banir usuário')
    } finally {
      setProcessingId(null)
    }
  }

  const handleLinkDiscord = async (id: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/keys/${id}/link-discord`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Link failed')
      toast.success(`Discord vinculado: ${data.username}`)
      onMutate()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao vincular Discord')
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (keys.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma key encontrada</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                License Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                NAME USER
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                HWID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                Expira
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keys.map((key) => {
              const daysLeft = getDaysRemaining(key.expires_at)
              return (
                <tr
                  key={key.id}
                  className="transition-colors hover:bg-secondary/50"
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground">
                        {key.key}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => copyKey(key.key)}
                        title="Copy Key"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">{key.label ?? '-'}</span>
                      {key.discord_id && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: {key.discord_id}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground font-mono">
                    {key.hwid ? (
                      <span title={key.hwid} className="max-w-[150px] truncate block">
                        {key.hwid}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge licenseKey={key} />
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 lg:table-cell">
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">
                        {key.expires_at ? formatDate(key.expires_at) : 'Não ativada'}
                      </span>
                      <span
                        className={`text-xs ${daysLeft === 0
                          ? 'text-destructive'
                          : daysLeft === null
                            ? 'text-blue-400'
                            : daysLeft <= 7
                              ? 'text-warning'
                              : 'text-muted-foreground'
                          }`}
                      >
                        {daysLeft === null
                          ? `${formatDuration(key.duration_seconds ?? 0)} (Pendente)`
                          : daysLeft === 0
                            ? 'Expirada'
                            : `${daysLeft} dia${daysLeft > 1 ? 's' : ''} restante${daysLeft > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/keys/${key.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            disabled={processingId === key.id}
                          >
                            {processingId === key.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-border bg-card">
                          <DropdownMenuItem
                            onClick={() => handleResetHWID(key.id)}
                            className="text-foreground transition-all duration-200 hover:bg-[#7c3aed] hover:text-white cursor-pointer"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset Hwid
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBanUser(key.id, key.status)}
                            className="text-destructive hover:text-white focus:text-white transition-all duration-200 hover:bg-destructive focus:bg-destructive cursor-pointer"
                            disabled={key.status === 'banned'}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => handleLinkDiscord(key.id)}
                            className="text-foreground transition-all duration-200 hover:bg-[#7c3aed] hover:text-white cursor-pointer"
                            disabled={!key.discord_id}
                          >
                            <Link2 className="mr-2 h-4 w-4" />
                            Vincular Discord
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
