const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");

const PORT = process.env.PORT || 3000;

// ලස්සන වෙබ් පිටුව (HTML/CSS)
const HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Oshada-MD Pairing</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { background-color: #1a202c; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #2d3748; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); width: 90%; max-width: 400px; text-align: center; }
        .header { display: flex; align-items: center; justify-content: start; color: #48bb78; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
        .tabs { display: flex; background: #1a202c; border-radius: 10px; padding: 5px; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; color: #a0aec0; }
        .tab.active { background: #48bb78; color: white; }
        input { width: 100%; padding: 12px; margin: 15px 0; border-radius: 8px; border: 1px solid #4a5568; background: #1a202c; color: white; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #4a5568; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; transition: 0.3s; }
        button:hover { background: #48bb78; }
        #result { margin-top: 20px; font-weight: bold; font-size: 22px; color: #48bb78; letter-spacing: 2px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header"><i class="fas fa-sign-in-alt" style="margin-right:10px"></i> Session Key</div>
        <div class="tabs">
            <div class="tab"><i class="fas fa-qrcode"></i> QR Code</div>
            <div class="tab active"><i class="fas fa-code"></i> Pairing Code</div>
        </div>
        <h3 style="font-size: 16px;">Pair Code Generation for OSHADA-MD</h3>
        <p style="font-size: 12px; color: #a0aec0;">Your WhatsApp Number (e.g., 9471xxxxxxx)</p>
        <input type="text" id="number" placeholder="94712345678">
        <button onclick="getCode()">Get Pairing Code</button>
        <div id="result"></div>
    </div>

    <script>
        async function getCode() {
            const num = document.getElementById('number').value;
            const resDiv = document.getElementById('result');
            resDiv.innerText = "Please wait...";
            try {
                const response = await fetch('/code?number=' + num);
                const data = await response.json();
                if(data.code) {
                    resDiv.innerText = data.code;
                } else {
                    resDiv.innerText = "Error! Try again.";
                }
            } catch (err) {
                resDiv.innerText = "Error connecting to server.";
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(HTML));

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.json({ error: "Number is required" });

    const { state, saveCreds } = await useMultiFileAuthState("./session");
    
    try {
        const conn = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" })
        });

        if (!conn.authState.creds.registered) {
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await conn.requestPairingCode(num);
            res.json({ code: code });
        }
    } catch (error) {
        res.json({ error: "Fail" });
    }
});

app.listen(PORT, () => console.log(`Oshada-MD running on port ${PORT}`));
