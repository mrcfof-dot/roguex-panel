async function testCreateKey() {
    const payload = {
        discord_id: "1449064387003551929",
        validity: "30s",
        label: "Test Advanced API"
    };

    try {
        const response = await fetch('http://localhost:3000/api/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\nSuccess! Key created with auto Discord fetch and 30s validity.');
        } else {
            console.error('\nFailed to create key.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testCreateKey();
