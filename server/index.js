const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8080',
        credentials: true
    }
});

const PORT = 3000;

app.get('/ping', (req, res) => {
    res.send('pong');
});

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('A user has connected!');
});
