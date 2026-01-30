// index.js
// Replit-ready Node.js server by OShada Os
require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid'); // For session IDs

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <h1>Hello from OShada Os!</h1>
    <p>Go to <a href="/session">/session</a> for one session ID</p>
    <p>Go to <a href="/sessions">/sessions</a> for 100 session IDs</p>
  `);
});

// Single session ID
app.get('/session', (req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});

// 100 session IDs
app.get('/sessions', (req, res) => {
  const sessions = [];
  for (let i = 0; i < 100; i++) {
    sessions.push(uuidv4());
  }
  res.json({ sessions });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
