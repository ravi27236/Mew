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
  res.send('<h1>Hello from OShada Os!</h1><p>Welcome to my Replit project.</p><p>Go to <a href="/session">/session</a> to get a new session ID</p>');
});

// Session ID endpoint
app.get('/session', (req, res) => {
  const sessionId = uuidv4(); // Generate a unique session ID
  res.json({ sessionId });
});

// Example API route
app.get('/api/info', (req, res) => {
  res.json({
    name: "OShada Os",
    project: "Replit-ready Node.js server",
    message: "This is a sample API endpoint!"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
