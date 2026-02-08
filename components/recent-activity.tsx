import type { AuthLog } from '@/lib/types'
import { formatDate } from '@/lib/keys'
import { CheckCircle, XCircle, RotateCcw, Ban, Key, Clock, Monitor, AlertTriangle } from 'lucide-react'

const eventConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  auth_success: { icon: CheckCircle, color: 'text-success', label: 'Auth OK' },
  auth_fail: { icon: XCircle, color: 'text-destructive', label: 'Auth Falhou' },
  hwid_reset: { icon: RotateCcw, color: 'text-primary', label: 'HWID Reset' },
  key_banned: { icon: Ban, color: 'text-destructive', label: 'Key Banida' },
  key_created: { icon: Key, color: 'text-primary', label: 'Key Criada' },
  key_expired: { icon: Clock, color: 'text-warning', label: 'Key Expirada' },
  hwid_mismatch: { icon: Monitor, color: 'text-warning', label: 'HWID Diferente' },
  device_limit: { icon: AlertTriangle, color: 'text-warning', label: 'Limite Dispositivos' },
}

export function RecentActivity({ logs }: { logs: AuthLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold text-foreground">Atividade Recente</h2>
      </div>
      <div className="divide-y divide-border">
        {logs.map((log) => {
          const config = eventConfig[log.event_type] ?? {
            icon: CheckCircle,
            color: 'text-muted-foreground',
            label: log.event_type,
          }
          const Icon = config.icon
          return (
            <div key={log.id} className="flex items-center gap-4 p-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{config.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {log.ip_address && `IP: ${log.ip_address}`}
                  {log.hwid && ` | HWID: ${log.hwid.slice(0, 12)}...`}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(log.created_at)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
