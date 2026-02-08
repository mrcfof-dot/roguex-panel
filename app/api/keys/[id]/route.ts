import pool from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { RowDataPacket } from 'mysql2'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const [keyRows] = await pool.query<RowDataPacket[]>('SELECT * FROM license_keys WHERE id = ?', [id])
        if (!keyRows.length) return NextResponse.json({ error: 'Key not found' }, { status: 404 })

        const [hwids] = await pool.query('SELECT * FROM hwids WHERE key_id = ? ORDER BY registered_at DESC', [id])
        const [logs] = await pool.query('SELECT * FROM auth_logs WHERE key_id = ? ORDER BY created_at DESC LIMIT 20', [id])

        return NextResponse.json({
            key: keyRows[0],
            hwids: hwids,
            logs: logs
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const body = await request.json()
        const { status, max_devices, expires_at, discord_id, label } = body

        // Construct dynamic update query
        const fields = []
        const values = []

        if (status) { fields.push('status = ?'); values.push(status) }
        if (max_devices) { fields.push('max_devices = ?'); values.push(max_devices) }
        if (expires_at) { fields.push('expires_at = ?'); values.push(expires_at) }
        if (discord_id !== undefined) { fields.push('discord_id = ?'); values.push(discord_id) }
        if (label !== undefined) { fields.push('label = ?'); values.push(label) }

        if (fields.length === 0) return NextResponse.json({ success: true })

        values.push(id)
        await pool.query(`UPDATE license_keys SET ${fields.join(', ')} WHERE id = ?`, values)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        await pool.query('DELETE FROM license_keys WHERE id = ?', [id])
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}
