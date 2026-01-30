// ================== MODULES ==================
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const express = require("express");
const pino = require("pino");

// ================== EXPRESS ==================
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== SESSION ==================
const SESSION_FOLDER = "./session";
let sock;

// ================== START BOT ==================
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["Oshada-MD", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startBot();
      }
    }

    if (connection === "open") {
      console.log("✅ OshadA Bot Connected");
    }
  });
}

startBot();

// ================== PAIRING API ==================
app.post("/pair", async (req, res) => {
  try {
    const number = req.body.number;
    if (!number) return res.json({ status: false, msg: "Number required" });
    if (!sock) return res.json({ status: false, msg: "Bot not ready" });

    const code = await sock.requestPairingCode(number);
    res.json({ status: true, code });

  } catch (e) {
    res.json({ status: false, msg: "Error generating code" });
  }
});

// ================== UI PAGE ==================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Oshada Session Key</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{
  background:linear-gradient(135deg,#020617,#020617);
  color:white;
  font-family:system-ui;
}
.card{
  max-width:420px;
  margin:auto;
  margin-top:70px;
  padding:22px;
  background:#0f172a;
  border-radius:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.4)
}
h1{
  text-align:center;
  margin-bottom:5px;
  color:#22c55e
}
p.sub{
  text-align:center;
  font-size:14px;
  opacity:.8
}
input,button{
  width:100%;
  padding:14px;
  margin-top:12px;
  border-radius:10px;
  border:none;
  font-size:15px
}
input{
  background:#020617;
  color:white;
  outline:1px solid #1e293b
}
button{
  background:#22c55e;
  font-weight:700;
  cursor:pointer
}
#out{
  text-align:center;
  margin-top:15px;
  font-size:18px;
  letter-spacing:2px
}
.footer{
  text-align:center;
  margin-top:20px;
  font-size:12px;
  opacity:.6
}
</style>
</head>
<body>

<div class="card">
  <h1>Oshada MD</h1>
  <p class="sub">WhatsApp Session / Pairing Code Generator</p>

  <input id="num" placeholder="9471xxxxxxx">
  <button onclick="pair()">Get Pairing Code</button>
