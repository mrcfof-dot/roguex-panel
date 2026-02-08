const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

async function testToken() {
    if (!BOT_TOKEN) {
        console.error('DISCORD_BOT_TOKEN not found in environment');
        process.exit(1);
    }

    try {
        const response = await fetch('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bot ${BOT_TOKEN}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Token is valid!');
            console.log(`Bot Name: ${data.username}`);
        } else {
            const error = await response.text();
            console.error(`Error: ${response.status} ${response.statusText}`);
            console.error(error);
        }
    } catch (err) {
        console.error('Failed to connect to Discord API:', err.message);
    }
}

testToken();
