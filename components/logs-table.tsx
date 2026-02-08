'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/keys'

interface Log {
    id: string
    key_id: string
    event_type: string
    ip_address: string
    hwid: string
    details: any
    created_at: Date
}

export function LogsTable({ logs }: { logs: Log[] }) {
    return (
        <div className="rounded-md border border-border">
            <ScrollArea className="h-[600px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Key ID</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>HWID</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant={log.event_type === 'auth_success' ? 'default' : 'destructive'}>
                                            {log.event_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{log.key_id || 'N/A'}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.ip_address || 'N/A'}</TableCell>
                                    <TableCell className="font-mono text-xs max-w-[150px] truncate" title={log.hwid}>
                                        {log.hwid || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(log.created_at.toString())}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    )
}
