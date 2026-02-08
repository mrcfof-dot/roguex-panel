import pool from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { getDiscordProfile } from '@/lib/discord'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        // 1. Get the key from DB to find the discord_id
        const [rows]: any = await pool.query('SELECT discord_id FROM license_keys WHERE id = ?', [id])
        if (!rows.length) return NextResponse.json({ error: 'Key not found' }, { status: 404 })

        const discordId = rows[0].discord_id
        if (!discordId) {
            return NextResponse.json({ error: 'No Discord ID associated with this key' }, { status: 400 })
        }

        // 2. Fetch profile from Discord
        const profile = await getDiscordProfile(discordId)

        // 3. Update DB
        await pool.query(
            'UPDATE license_keys SET discord_username = ?, discord_avatar = ? WHERE id = ?',
            [profile.username, profile.avatar, id]
        )

        return NextResponse.json({
            success: true,
            username: profile.username,
            avatar: profile.avatar
        })
    } catch (error: any) {
        console.error('Discord link error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to link Discord'
        }, { status: 500 })
    }
}
