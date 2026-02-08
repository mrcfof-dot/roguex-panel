import pool from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        await pool.query('DELETE FROM hwids WHERE key_id = ?', [id])
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
    }
}
