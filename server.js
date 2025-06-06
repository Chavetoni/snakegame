const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;


app.use(express.static('public'));


app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});


app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Route for the main game
app.get('/', (req, res) => {
    
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});


app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
app.listen(port, () => {
    console.log(`🐍 Snake Game Server running at http://localhost:${port}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`🏥 Health check available at: http://localhost:${port}/health`);
});


app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Sorry, can't find ${req.url}`,
        timestamp: new Date().toISOString()
    });
});


app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the server',
        timestamp: new Date().toISOString()
    });
});


process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT signal, shutting down gracefully...');
    process.exit(0);
});
