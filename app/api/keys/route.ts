import pool from '@/lib/db'
import crypto from 'crypto'
import { NextResponse } from 'next/server'



export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT k.*, 
            (SELECT hwid FROM hwids h WHERE h.key_id = k.id ORDER BY registered_at ASC LIMIT 1) as hwid 
            FROM license_keys k 
            ORDER BY k.created_at DESC
        `)
        return NextResponse.json(rows)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 })
    }
}

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function getDiscordProfile(discordId: string) {
    if (!BOT_TOKEN) return null;
    try {
        const response = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return {
            username: `${data.username}${data.discriminator !== '0' ? `#${data.discriminator}` : ''}`,
            avatar: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null
        };
    } catch {
        return null;
    }
}

function parseValidity(validity: string): number {
    const val = validity.toLowerCase().trim();

    if (val === 'lifetime') {
        return 100 * 365 * 24 * 60 * 60; // 100 years in seconds
    }

    const match = val.match(/^(\d+)([ds])$/);
    if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2];
        return unit === 'd' ? amount * 24 * 60 * 60 : amount;
    }

    // Default to days if just a number
    const days = parseInt(val) || 30;
    return days * 24 * 60 * 60;
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { key, label, max_devices, expires_at, notes, discord_id, hwid, validity } = body

        // If validity is provided, parse it to duration in seconds
        const durationSeconds = validity ? parseValidity(validity) : 30 * 24 * 60 * 60;

        // Auto-fetch Discord name if ID is provided
        let discord_username = null;
        let discord_avatar = null;

        if (discord_id) {
            const profile = await getDiscordProfile(discord_id);
            if (profile) {
                discord_username = profile.username;
                discord_avatar = profile.avatar;
            }
        }

        const id = crypto.randomUUID()

        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()

            await connection.query(
                `INSERT INTO license_keys (id, \`key\`, label, max_devices, expires_at, duration_seconds, notes, discord_id, discord_username, discord_avatar) 
           VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)`,
                [id, key || discord_id, label, max_devices || 1, durationSeconds, notes, discord_id, discord_username, discord_avatar]
            )

            if (hwid) {
                await connection.query(
                    `INSERT INTO hwids (id, key_id, hwid) VALUES (UUID(), ?, ?)`,
                    [id, hwid]
                )
            }

            await connection.commit()
            return NextResponse.json({ success: true, id })
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'conflict', message: 'Esta Key ja Existe' }, { status: 409 })
        }
        console.error('Create key error:', error)
        return NextResponse.json({ error: 'server_error', message: 'Failed to create key' }, { status: 500 })
    }
}
