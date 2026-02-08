import pool from '@/lib/db'
import crypto from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// Rate limiting: simple in-memory store (per serverless instance - strict enough for this demo)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT = 30 // max requests per window
const RATE_WINDOW = 60_000 // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.lastReset > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  // Rate limit check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'rate_limited', message: 'Rate limit exceeded. Try again in 1 minute.' },
      { status: 429 }
    )
  }

  let body: { key?: string; hwid?: string; discord_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_body', message: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  // Check Settings (Maintenance / Service Status)
  try {
    const [settings] = await pool.execute<RowDataPacket[]>('SELECT * FROM settings')
    const config: Record<string, string> = {}
    settings.forEach((row: any) => {
      config[row.setting_key] = row.setting_value
    })

    if (config['maintenance_mode'] === 'true') {
      return NextResponse.json(
        { success: false, error: 'maintenance_mode', message: 'System is in maintenance mode.' },
        { status: 503 }
      )
    }

    if (config['service_status'] === 'false') {
      return NextResponse.json(
        { success: false, error: 'service_offline', message: 'Service is currently offline.' },
        { status: 503 }
      )
    }
  } catch (err) {
    console.error('Settings check failed:', err)
  }

  const { key, hwid, discord_id } = body

  if (!key || !hwid) {
    return NextResponse.json(
      { success: false, error: 'missing_params', message: 'Missing key or hwid.' },
      { status: 400 }
    )
  }

  const DEVELOPER_ID = "1408529674581049344"

  try {
    // Find the key
    const [keys] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM license_keys WHERE `key` = ?',
      [key]
    )

    const keyData = keys[0]

    if (!keyData) {
      await logEvent(null, 'auth_fail', ip, hwid, { reason: 'key_not_found', key })
      return NextResponse.json(
        { success: false, error: 'invalid_key', message: 'Invalid Key.' },
        { status: 401 }
      )
    }

    // Check if user is developer (if discord_id provided)
    const isDeveloper = discord_id === DEVELOPER_ID

    // Check if banned

    // Check if banned
    if (keyData.status === 'banned') {
      await logEvent(keyData.id, 'auth_fail', ip, hwid, { reason: 'key_banned' })
      return NextResponse.json(
        { success: false, error: 'key_banned', message: 'Key is banned.' },
        { status: 403 }
      )
    }

    // Check expiration if already activated
    if (keyData.activated_at) {
      if (new Date(keyData.expires_at) < new Date()) {
        await logEvent(keyData.id, 'auth_fail', ip, hwid, { reason: 'key_expired' })
        return NextResponse.json(
          { success: false, error: 'key_expired', message: 'Key expired.' },
          { status: 403 }
        )
      }
    } else {
      // First use! Activate the key
      const now = new Date();
      const durationSeconds = keyData.duration_seconds || 30 * 24 * 60 * 60;
      const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

      await pool.execute(
        'UPDATE license_keys SET activated_at = ?, expires_at = ? WHERE id = ?',
        [now, expiresAt, keyData.id]
      );

      // Update local keyData for the response
      keyData.activated_at = now;
      keyData.expires_at = expiresAt;
    }

    // Check HWID
    const [hwids] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM hwids WHERE key_id = ?',
      [keyData.id]
    )

    // Typecast to array of objects
    const hwidList = Array.isArray(hwids) ? hwids : []
    const hwidMatch = hwidList.find((h: any) => h.hwid === hwid)

    if (!hwidMatch) {
      // Check device limit
      if (hwidList.length >= keyData.max_devices) {
        await logEvent(keyData.id, 'device_limit', ip, hwid, {
          reason: 'device_limit_exceeded',
          current: hwidList.length,
          max: keyData.max_devices,
        })
        return NextResponse.json(
          {
            success: false,
            error: 'device_limit',
            message: `Device limit exceeded (${hwidList.length}/${keyData.max_devices}).`,
          },
          { status: 403 }
        )
      }

      // Register new HWID
      const hwidId = crypto.randomUUID()
      await pool.execute(
        'INSERT INTO hwids (id, key_id, hwid, ip_address, last_seen_at) VALUES (?, ?, ?, ?, NOW())',
        [hwidId, keyData.id, hwid, ip]
      )
    } else {
      // Update existing HWID last seen and IP
      await pool.execute(
        'UPDATE hwids SET last_seen_at = NOW(), ip_address = ? WHERE id = ?',
        [ip, hwidMatch.id]
      )
    }

    // Log successful auth
    await logEvent(keyData.id, 'auth_success', ip, hwid, { is_developer: isDeveloper })

    return NextResponse.json({
      success: true,
      message: 'Authenticated successfully.',
      data: {
        key: keyData.key,
        label: keyData.label,
        expires_at: keyData.expires_at,
        discord_id: keyData.discord_id || discord_id,
        discord_username: keyData.discord_username,
        max_devices: keyData.max_devices,
        devices_used: hwidMatch ? hwidList.length : hwidList.length + 1,
        is_developer: isDeveloper
      },
    })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'Internal server error.' },
      { status: 500 }
    )
  }
}

async function logEvent(
  keyId: string | null,
  eventType: string,
  ip: string,
  hwid: string,
  details: Record<string, unknown>
) {
  try {
    const id = crypto.randomUUID()
    await pool.execute(
      'INSERT INTO auth_logs (id, key_id, event_type, ip_address, hwid, details) VALUES (?, ?, ?, ?, ?, ?)',
      [id, keyId, eventType, ip, hwid, JSON.stringify(details)]
    )
  } catch (err) {
    console.error('Failed to log event:', err)
  }
}
