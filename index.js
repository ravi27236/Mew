const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    jidDecode
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');
const { Boom } = require('@hapi/boom');

// --- ඔබේ තොරතුරු මෙතැනට ඇතුළත් කරන්න ---
const SESSION_ID = 'PRABATH-MD~iDvkBzVQ8OEQFC5'; 
const PREFIX = '.'; // බොට්ගේ Command වලට පාවිච්චි කරන ලකුණ
// ------------------------------------

async function startPrabathBot() {
    // Session folder එකක් නැතිනම් සාදා ගැනීම
    if (!fs.existsSync('./session')) {
        fs.mkdirSync('./session');
    }

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ["Prabath-MD", "Chrome", "1.0.0"]
    });

    // Creds save කිරීම
    sock.ev.on('creds.update', saveCreds);

    // සම්බන්ධතාවය පරීක්ෂා කිරීම
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('සම්බන්ධතාවය බිඳ වැටුණි. නැවත සම්බන්ධ වෙමින්...', shouldReconnect);
            if (shouldReconnect) startPrabathBot();
        } else if (connection === 'open') {
            console.log('✅ Prabath-MD සාර්ථකව සම්බන්ධ විය!');
            console.log('🚀 බොට් දැන් වැඩ කිරීමට සූදානම්.');
            sock.sendMessage(sock.user.id, { text: '*ප්‍රභාත් MD පණගැන්වුණා!* ✅\n\nCommand එකක් පරීක්ෂා කිරීමට .ping ලෙස ටයිප් කරන්න.' });
        }
    });

    // පණිවිඩ ලැබෙන විට ක්‍රියාත්මක වන කොටස
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;

            const from = mek.key.remoteJid;
            const messageType = Object.keys(mek.message)[0];
            const body = (messageType === 'conversation') ? mek.message.conversation : (messageType === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
            
            const isCmd = body.startsWith(PREFIX);
            const command = isCmd ? body.slice(PREFIX.length).trim().split(' ').shift().toLowerCase() : undefined;

            // --- Commands ---
            
            if (command === 'ping') {
                await sock.sendMessage(from, { text: 'Pong! 🏓' }, { quoted: mek });
            }

            if (command === 'alive') {
                await sock.sendMessage(from, { 
                    text: '*Prabath-MD සක්‍රීයයි!* 🛡️\n\nසෑම දෙයක්ම හොඳින් ක්‍රියාත්මක වේ.' 
                }, { quoted: mek });
            }

            if (command === 'menu') {
                let menuText = `*--- PRABATH MD MENU ---*\n\n`;
                menuText += `> .ping - බෝට්ගේ වේගය බැලීමට\n`;
                menuText += `> .alive - බෝට් වැඩදැයි බැලීමට\n`;
                menuText += `> .menu - සියලුම විධාන බැලීමට\n`;
                await sock.sendMessage(from, { text: menuText }, { quoted: mek });
            }

        } catch (err) {
            console.log(err);
        }
    });
}

// බොට් ආරම්භ කරන්න
startPrabathBot();
