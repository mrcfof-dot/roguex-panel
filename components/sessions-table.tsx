'use client'

import { formatRelativeTime } from '@/lib/keys'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Session {
    id: string
    key_id: string
    discord_id: string | null
    hwid: string
    ip_address: string | null
    registered_at: string
    last_seen_at: string | null
}

function StatusBadge({ lastSeenAt }: { lastSeenAt: string | null }) {
    // Logic: < 10 minutes = Active/Inativo?
    // User image says "Inativo" for "há cerca de 4 horas".
    // I'll assume if lastSeen < 5 mins -> Ativo. Else Inativo.

    let isActive = false
    if (lastSeenAt) {
        const diff = Date.now() - new Date(lastSeenAt).getTime()
        isActive = diff < 5 * 60 * 1000 // 5 minutes
    }

    return (
        <Badge
            variant="outline"
            className={isActive
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-neutral-500/30 bg-neutral-500/10 text-neutral-500'
            }
        >
            {isActive ? 'Ativo' : 'Inativo'}
        </Badge>
    )
}

export function SessionsTable({
    sessions,
    isLoading,
}: {
    sessions: Session[]
    isLoading: boolean
}) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    if (sessions.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma sessao encontrada</p>
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
                                Chave
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                HWID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                IP
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Último ping
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Iniciada
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">

                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sessions.map((session) => (
                            <tr
                                key={session.id}
                                className="transition-colors hover:bg-secondary/50"
                            >
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                                    {session.discord_id || '-'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground font-mono">
                                    <span title={session.hwid} className="max-w-[150px] truncate block">
                                        {session.hwid}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground font-mono">
                                    {session.ip_address || '-'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <StatusBadge lastSeenAt={session.last_seen_at} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                                    {formatRelativeTime(session.last_seen_at)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                                    {formatRelativeTime(session.registered_at)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
