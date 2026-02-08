'use client'

import useSWR from 'swr'
import { SessionsTable } from '@/components/sessions-table'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SessionsPage() {
    const { data: sessions, error, isLoading } = useSWR('/api/sessions', fetcher, { refreshInterval: 10000 })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Sessões</h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor active sessions
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    Failed to load sessions: {error.message || 'Unknown error'}
                </div>
            )}

            <SessionsTable sessions={Array.isArray(sessions) ? sessions : []} isLoading={isLoading} />
        </div>
    )
}
