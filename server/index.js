const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = 3000;

app.get('/ping', (req, res) => {
    res.send('pong');
});

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});