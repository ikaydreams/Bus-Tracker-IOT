// Simple HTTP server for frontend (runs on port 5000)
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from public directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for all routes (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.FRONTEND_PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
