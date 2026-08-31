const WebSocket = require('ws');

const PRIORITY_CHANNELS = [
    "maxigashi",
    "mabaxu",
    "slowek",
    "chylek",
    "avalanche_1",
    "dionizeuus",
    "johnnybl4ze",
    
];

const KICK_SESSION = "eyJpdiI6IkNnVWlCcERxTlUvcEU2cUIzd2JkTVE9PSIsInZhbHVlIjoiUzFiRHFXd0JaMEhxcU9BcHBEQldmTUZpeVdJNVRYLzhFTmlSTTEweGxjOWF0VWVvcWJuZXNJd0V4Y3lEWGFvWVc0WlNHbkF6VHlKYkhUdDhxN2NiRllHOEJCVGVVRVhyUG1Cakc3Q2J6d3VhV2tTS0dWQ21USjJJTWpQWVZPeC8iLCJtYWMiOiJhOGNjZjliYzhkZjAzZWI5YjJjYTI0YjFmMWVlMmEzNzBkYWI3MmMwMGMzMGFhNzc5YzhkZWMzYjQxMDQ4ZTNkIiwidGFnIjoiIn0%3D";

console.log("==================================================");
console.log(` Uruchamianie bota dla ${PRIORITY_CHANNELS.length} kanałów...`);
console.log("==================================================");

function connectToChannel(channelName, index) {
    const ws = new WebSocket('wss://ws-us2.pusher.com/app/eb1d5f2ebd866628b727?protocol=7&client=js&version=7.4.0&flash=false', {
        headers: {
            'Cookie': `kick_session=${KICK_SESSION};`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://kick.com'
        }
    });

    ws.on('open', () => {
        console.log(`[+] POŁĄCZONO (${index + 1}/${PRIORITY_CHANNELS.length}): ${channelName}`);
        
        // Subskrypcja ogólna channel
        ws.send(JSON.stringify({
            event: "pusher:subscribe",
            data: { auth: "", channel: `channel.${channelName}` }
        }));
    });

    ws.on('message', (data) => {
        try {
            const payload = JSON.parse(data.toString());
            
            if (payload.event === 'pusher:ping') {
                ws.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
                const now = new Date().toLocaleTimeString('pl-PL');
                console.log(`[PONG ${now}] Utrzymano sesję dla: ${channelName}`);
            }
        } catch (e) {}
    });

    ws.on('close', (code) => {
        console.log(`[-] ROZŁĄCZONO: ${channelName} (kod: ${code}). Reconnect za 15s...`);
        setTimeout(() => connectToChannel(channelName, index), 15000);
    });

    ws.on('error', () => {});
}

PRIORITY_CHANNELS.forEach((channel, index) => {
    setTimeout(() => {
        connectToChannel(channel, index);
    }, index * 3000);
});
