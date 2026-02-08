import pool from '@/lib/db'
import { StatsCards } from '@/components/stats-cards'
import { RecentActivity } from '@/components/recent-activity'
import { RowDataPacket } from 'mysql2'

export default async function DashboardPage() {
  const [keys] = await pool.query<RowDataPacket[]>('SELECT id, status, expires_at FROM license_keys')
  const [hwids] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM hwids')
  const [logs] = await pool.query<RowDataPacket[]>('SELECT * FROM auth_logs ORDER BY created_at DESC LIMIT 10')

  const now = new Date()
  const keysList = Array.isArray(keys) ? keys : []
  const hwidsCount = Array.isArray(hwids) ? hwids[0].count : 0
  const logsList = Array.isArray(logs) ? logs : []

  const stats = {
    total_keys: keysList.length,
    active_keys: keysList.filter(
      (k: any) => k.status === 'active' && new Date(k.expires_at) > now
    ).length,
    expired_keys: keysList.filter(
      (k: any) => k.status === 'expired' || (k.status === 'active' && new Date(k.expires_at) <= now)
    ).length,
    banned_keys: keysList.filter((k: any) => k.status === 'banned').length,
    total_hwids: hwidsCount,
    recent_auths: logsList.filter((l: any) => l.event_type === 'auth_success').length,
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">License System Overview</p>
      </div>
      <StatsCards stats={stats} />
      <RecentActivity logs={logsList as any[]} />
    </div>
  )
}
