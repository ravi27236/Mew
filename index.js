const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs');
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function generateSession() {
    // පරණ දත්ත නිසා එන අවුල් නැති කරන්න auth_info අලුත් කරමු
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Mac OS", "Chrome", "10.15.7"],
    });

    if (!sock.authState.creds.registered) {
        console.log("සම්බන්ධතාවය සකසමින් පවතී... කරුණාකර තත්පර 15ක් රැඳී සිටින්න.");
        // Replit එකේ Internet එක Stable වෙනකම් හොඳ වෙලාවක් දෙමු
        await delay(15000); 
        
        const phoneNumber = await question('\nඔබේ WhatsApp අංකය ඇතුළත් කරන්න (උදා: 947XXXXXXXX): ');
        
        try {
            console.log("Pairing Code එක ලබා ගනිමින් පවතී...");
            const code = await sock.requestPairingCode(phoneNumber.trim());
            console.log(`\nඔබේ Pairing Code එක මෙන්න: ${code}\n`);
        } catch (err) {
            console.log("\nError එකක් ආවා. කරුණාකර නැවත Run කරන්න.");
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log("\nසම්බන්ධතාවය සාර්ථකයි! ✅");
            await delay(5000);
            const rawCreds = fs.readFileSync('./auth_info/creds.json');
            const sessionId = Buffer.from(rawCreds).toString('base64');
            const myNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            await sock.sendMessage(myNumber, { text: `SESSION_ID::${sessionId}` });
            console.log("\nSession ID එක WhatsApp එකට එවනු ලැබුවා! 🚀");
            process.exit(0);
        }
    });
}

generateSession();
