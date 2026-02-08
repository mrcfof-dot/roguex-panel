import pool from '@/lib/db'
import { NextResponse } from 'next/server'
import { RowDataPacket } from 'mysql2'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        h.id, 
        h.key_id, 
        k.discord_id, 
        h.hwid, 
        h.ip_address, 
        h.registered_at, 
        h.last_seen_at
      FROM hwids h 
      JOIN license_keys k ON h.key_id = k.id
      ORDER BY h.last_seen_at DESC
    `)

        return NextResponse.json(rows)
    } catch (error) {
        console.error('Failed to fetch sessions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        )
    }
}
