const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require('fs');
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function generateSession() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    // ප්‍රශ්නය අහන්න කලින් තත්පර 3ක් ඉමු (Connection එක හැදෙනකම්)
    if (!sock.authState.creds.registered) {
        console.log("සම්බන්ධ වෙමින් පවතී... කරුණාකර තත්පර කිහිපයක් රැඳී සිටින්න.");
        await delay(3000); 
        const phoneNumber = await question('\nකරුණාකර ඔබේ WhatsApp අංකය ඇතුළත් කරන්න (උදා: 947XXXXXXXX): ');
        
        try {
            const code = await sock.requestPairingCode(phoneNumber.trim());
            console.log(`\nඔබේ Pairing Code එක මෙන්න: ${code}\n`);
        } catch (err) {
            console.log("Pairing Code එක ලබා ගැනීමට නොහැකි වුණා. නැවත උත්සාහ කරන්න.", err);
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log("සම්බන්ධතාවය සාර්ථකයි! ✅");
            await delay(5000);

            const rawCreds = fs.readFileSync('./auth_info/creds.json');
            const sessionId = Buffer.from(rawCreds).toString('base64');

            const myNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            await sock.sendMessage(myNumber, { text: `*SESSION_ID*::${sessionId}` });
            
            console.log("\nSession ID එක ඔබේ WhatsApp එකට එවනු ලැබුවා! 🚀");
            console.log("බොට් නතර කිරීමට Ctrl + C ඔබන්න.");
        }
    });
}

generateSession();
