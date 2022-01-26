const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8080',
        credentials: true
    }
});

let rooms = [];

const fillGameState = (existingState) => {
    const state = existingState;
    for (let i = state.length; i < 6; i++) {
        let row = {};
        row.tiles = [];
        for (let j = 0; j < 5; j++) {
            row.tiles.push({
                letter: ''
            });
        }
        state.push(row);
    }
    return state;
}

const PORT = 3000;

app.get('/ping', (req, res) => {
    res.send('pong');
});

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('A user has connected!');
    socket.on('join', (data) => {
        console.log(data);
    });
    socket.on('create', (data) => {
        console.log('create called!');
        const roomName = Math.random().toString(36).substring(2, 6).toUpperCase();
        rooms = rooms.filter(x => x.name != roomName);
        rooms.push({
            name: roomName,
            state: fillGameState([]),
            word: 'ABCDE'
        });
        socket.emit('roomCreated', roomName);
        socket.emit('gameState', rooms.find(x => x.name === roomName).state);
    });
    socket.on('join', (data) => {
        console.log(socket.username + ' is joining ' + data);
        if (rooms.find(x => x.name === data)) {
            socket.join(data);
            socket.emit('roomJoined', data);
            socket.emit('gameState', rooms.find(x => x.name === data).state);
            return;
        }
        socket.emit('error', 'Room not found!');
    });
    socket.on('leave', (data) => {
        console.log(socket.username + ' is leaving ' + data);
        socket.leave(data);
        socket.emit('roomLeft', data);
    });
    socket.on('setName', (data) => {
        socket.username = data;
        console.log(socket.username + ' name set');
    });
    socket.on('guess', (data) => {
        const word = data.word.toUpperCase();
        const channel = data.room;
        const correctWord = rooms.find(x => x.name === channel).word;
        const newRow = [];
        for (let i = 0; i < word.length; i++) {
            if (word[i] === correctWord[i]) {
                newRow.push({
                    letter: word[i],
                    status: 'correct'
                });
            }
            else if (correctWord.includes(word[i])) {
                newRow.push({
                    letter: word[i],
                    status: 'partial'
                });
            } else {
                newRow.push({
                    letter: word[i],
                    status: 'wrong'
                });
            }
        }
        const existingState = rooms.find(x => x.name === data.room).state;
        existingState.push({ tiles: newRow });
        rooms.find(x => x.name === data.room).state = fillGameState(existingState);
        socket.emit('gameState', fillGameState(existingState));
        console.log(fillGameState(existingState));
    });
});
