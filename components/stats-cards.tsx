import { Key, CheckCircle, XCircle, Ban, Monitor, Activity } from 'lucide-react'
import type { DashboardStats } from '@/lib/types'

const stats = [
  {
    key: 'total_keys' as const,
    label: 'Total de Keys',
    icon: Key,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    key: 'active_keys' as const,
    label: 'Keys Ativas',
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    key: 'expired_keys' as const,
    label: 'Keys Expiradas',
    icon: XCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    key: 'banned_keys' as const,
    label: 'Keys Banidas',
    icon: Ban,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    key: 'total_hwids' as const,
    label: 'Dispositivos',
    icon: Monitor,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    key: 'recent_auths' as const,
    label: 'Auths Recentes',
    icon: Activity,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
]

export function StatsCards({ stats: data }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data[stat.key]}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
