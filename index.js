// index.js
// Replit-ready Node.js server by OShada Os

// Load environment variables from .env file
require('dotenv').config();

// Import Express
const express = require('express');
const app = express();

// Port setup (Replit automatically sets process.env.PORT)
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('<h1>Hello from OShada Os!</h1><p>Welcome to my Replit project.</p>');
});

// Example API route
app.get('/api/info', (req, res) => {
  res.json({
    name: "OShada Os",
    project: "Replit-ready Node.js server",
    message: "This is a sample API endpoint!"
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
