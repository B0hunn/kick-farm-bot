const WebSocket = require('ws');

// ===================================================
// LISTA STREAMERÓW (22 KANAŁY Z TWOJEJ LISTY)
// ===================================================
const CHANNELS = [
    "maxigashi",
    "mabaxu",
    "chylek",
    "slowek",
    "mnichglaukos",
    "avalanche_1",
    "pajotreq",
    "dionizeuus",
    "johnnybl4ze",
    ];

// ===================================================
// TWÓJ TOKEN KICK_SESSION
// ===================================================
const KICK_SESSION = "eyJpdiI6IktjNkhMakFnUDV0bEg5VkFMb1VaMlE9PSIsInZhbHVlIjoiYXRqS3N1clVVZmh4NnloRUJEVW5IcUF4TGFMWElOSG5sbDMzdDNMYjF1WDJrUDNnRng5dGgyUkprZnpjREtTRzluWDFvQTM3ZDJ5YmVydEJqUktzMXlMU0FVRUxxcTJkOTd0ZHc2M1p2WUdCT3cxeCtnOGRwMWkwZ25BNnBZVWkiLCJtYWMiOiIyYWIyMTUzMmRhNGY5ZDNlMmMyNWI5NDcxZjE1MDQ4NWFhZmQ4ZTg0YjJkNTBlNGZkZTdlNzlmZWUxZmU5MWI1IiwidGFnIjoiIn0%3D";

console.log("==================================================");
console.log(`Uruchamianie bota w chmurze dla ${CHANNELS.length} kanałów...`);
console.log("==================================================");

function connectToChannel(channelName, index) {
    // Odstęp 800 ms pomiędzy łączeniem do kolejnych kanałów
    setTimeout(() => {
        const ws = new WebSocket('wss://ws-us2.pusher.com/app/eb1d5f2ebd866628b727?protocol=7&client=js&version=7.4.0&flash=false', {
            headers: {
                'Cookie': `kick_session=${KICK_SESSION};`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        ws.on('open', () => {
            console.log(`[+] DOŁĄCZONO (${index + 1}/${CHANNELS.length}): ${channelName}`);
            
            // Subskrypcja czatu bota
            const subscribePayload = JSON.stringify({
                event: "pusher:subscribe",
                data: {
                    auth: "",
                    channel: `chatrooms.${channelName}.v2`
                }
            });
            ws.send(subscribePayload);
        });

        // Wysyłanie pingu co 30 sekund (utrzymanie obecności i zbieranie punktów)
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ event: "pusher:ping", data: {} }));
            }
        }, 30000);

        ws.on('close', () => {
            console.log(`[-] ROZŁĄCZONO: ${channelName}. Ponowne łączenie za 15 sekund...`);
            clearInterval(pingInterval);
            setTimeout(() => connectToChannel(channelName, index), 15000);
        });

        ws.on('error', (err) => {
            console.error(`[!] BŁĄD [${channelName}]:`, err.message);
        });
    }, index * 800);
}

// Uruchomienie bota dla wszystkich kanałów
CHANNELS.forEach((channel, index) => connectToChannel(channel, index));
