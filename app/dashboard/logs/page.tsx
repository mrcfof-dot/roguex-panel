import pool from '@/lib/db'
import { LogsTable } from '@/components/logs-table'
import { RowDataPacket } from 'mysql2'

interface Log extends RowDataPacket {
  id: string
  key_id: string
  event_type: string
  ip_address: string
  hwid: string
  details: any
  created_at: Date
}

export default async function LogsPage() {
  const [logs] = await pool.query<Log[]>('SELECT * FROM auth_logs ORDER BY created_at DESC LIMIT 100')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Logs</h1>
        <p className="text-sm text-muted-foreground">
          Recent authentication activity
        </p>
      </div>

      <LogsTable logs={Array.isArray(logs) ? logs : []} />
    </div>
  )
}
