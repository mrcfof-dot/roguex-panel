import pool from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { RowDataPacket } from 'mysql2'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM settings')

        // Convert array of rows to object
        const settings: Record<string, string> = {}
        rows.forEach((row: any) => {
            settings[row.setting_key] = row.setting_value
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Failed to fetch settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { key, value } = body

        if (!key || value === undefined) {
            return NextResponse.json(
                { error: 'Missing key or value' },
                { status: 400 }
            )
        }

        await pool.execute(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, String(value), String(value)]
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update setting:', error)
        return NextResponse.json(
            { error: 'Failed to update setting' },
            { status: 500 }
        )
    }
}
