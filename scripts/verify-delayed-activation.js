async function verifyDelayedActivation() {
    const baseUrl = 'http://localhost:3000';
    const uniqueId = `test-${Math.random().toString(36).slice(2, 11)}`;

    console.log(`--- Phase 1: Create Key (${uniqueId}) ---`);
    const createRes = await fetch(`${baseUrl}/api/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: uniqueId, validity: "1d" })
    });
    const createData = await createRes.json();
    const keyId = createData.id;
    console.log('Key Created:', keyId);

    console.log('\n--- Phase 2: Check Key Status before activation ---');
    const getRes = await fetch(`${baseUrl}/api/keys`);
    const allKeys = await getRes.json();
    const myKey = allKeys.find(k => k.id === keyId);
    console.log('Expires At (pre-activation):', myKey.expires_at);
    console.log('Activated At (pre-activation):', myKey.activated_at);

    console.log('\n--- Phase 3: First Authentication (Activation) ---');
    const authRes = await fetch(`${baseUrl}/api/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: myKey.key, hwid: 'test-hwid-123' })
    });
    const authData = await authRes.json();
    console.log('Auth Success:', authData.success);
    console.log('Activated Expiry:', authData.data.expires_at);

    console.log('\n--- Phase 4: Verify Database Update ---');
    const getRes2 = await fetch(`${baseUrl}/api/keys`);
    const allKeys2 = await getRes2.json();
    const myKey2 = allKeys2.find(k => k.id === keyId);
    console.log('Expires At (post-activation):', myKey2.expires_at);
    console.log('Activated At (post-activation):', myKey2.activated_at);

    if (myKey2.expires_at && myKey2.activated_at) {
        console.log('\nVERIFICATION SUCCESSFUL: Key activated on first use.');
    } else {
        console.error('\nVERIFICATION FAILED: Key not activated correctly.');
    }
}

verifyDelayedActivation();
