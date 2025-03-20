const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket Proxy
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            let url = JSON.parse(message).url;
            ws.send(`Proxying: ${url}`);

            app.use('/proxy', createProxyMiddleware({
                target: url,
                changeOrigin: true,
                ws: true,
            }));
        } catch (err) {
            ws.send('Error: Invalid URL');
        }
    });
});

// HTTP Proxy
app.use('/proxy', createProxyMiddleware({
    target: 'https://www.example.com', // Default target
    changeOrigin: true,
    pathRewrite: {
        '^/proxy': '',
    },
}));

// Randomized Paths (Avoid Detection)
const randomPaths = ['/api', '/browse', '/data', '/cdn', '/load'];
randomPaths.forEach(path => {
    app.use(path, createProxyMiddleware({
        target: 'https://www.example.com',
        changeOrigin: true,
        pathRewrite: { [`^${path}`]: '' },
    }));
});

server.listen(3000, () => console.log('🔥 WebSocket & HTTP Proxy running on port 3000'));
