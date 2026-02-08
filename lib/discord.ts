const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function getDiscordProfile(discordId: string) {
    if (!BOT_TOKEN) {
        throw new Error('DISCORD_BOT_TOKEN not configured in .env');
    }

    const response = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Discord API error: ${response.status} ${errorBody}`);
        throw new Error(`Failed to fetch Discord profile: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        username: `${data.username}${data.discriminator !== '0' ? `#${data.discriminator}` : ''}`,
        avatar: data.avatar
            ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
            : null,
    };
}
