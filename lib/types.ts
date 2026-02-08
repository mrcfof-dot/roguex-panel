export interface LicenseKey {
  id: string
  key: string
  label: string | null
  status: 'active' | 'banned' | 'expired'
  max_devices: number
  expires_at: string | null
  activated_at?: string | null
  duration_seconds?: number | null
  discord_id: string | null
  discord_username?: string | null
  discord_avatar?: string | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  hwid?: string | null
}

export interface HWID {
  id: string
  key_id: string
  hwid: string
  device_label: string | null
  ip_address: string | null
  last_seen_at?: string | null
  registered_at: string
}

export interface AuthLog {
  id: string
  key_id: string | null
  event_type: string
  ip_address: string | null
  hwid: string | null
  details: Record<string, unknown>
  created_at: string
}

export interface DashboardStats {
  total_keys: number
  active_keys: number
  expired_keys: number
  banned_keys: number
  total_hwids: number
  recent_auths: number
}
