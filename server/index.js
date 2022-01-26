const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const words = require('./words.json');
const validWords = require('./validWords.json');
const fullValidWordList = words.concat(validWords);
const fs = require('fs');

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:8080'],
        credentials: true
    }
});

let rooms = [];
if (fs.existsSync('./rooms.json')) {
    rooms = require('./rooms.json');
}

const saveRoomsState = () => {
    fs.writeFileSync('./rooms.json', JSON.stringify(rooms));
}

const fillGameState = (existingState) => {
    const state = JSON.parse(JSON.stringify(existingState));
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

function getRandomWord() {
    return words[Math.round(Math.random() * (words.length - 1))].toUpperCase();
}

String.prototype.replaceAt = function (index, replacement) {
    if (index >= this.length) {
        return this.valueOf();
    }

    return this.substring(0, index) + replacement + this.substring(index + 1);
}


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
            state: [],
            word: getRandomWord()
        });
        socket.emit('roomCreated', roomName);
        socket.emit('gameState', fillGameState(rooms.find(x => x.name === roomName).state));
        saveRoomsState();
    });
    socket.on('join', (data) => {
        console.log(socket.username + ' is joining ' + data);
        if (rooms.find(x => x.name === data)) {
            socket.join(data);
            socket.emit('roomJoined', data);
            socket.emit('gameState', fillGameState(rooms.find(x => x.name === data).state));
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
    socket.on('newGame', (room) => {
        rooms = rooms.filter(x => x.name != room);
        rooms.push({
            name: room,
            state: [],
            word: getRandomWord()
        });
        io.to(channel).emit('gameState', fillGameState(room.state));
        saveRoomsState();
    });
    socket.on('guess', (data) => {
        const word = data.word.toUpperCase().trim().substring(0, 5);
        const channel = data.room;
        const room = rooms.find(x => x.name === data.room);
        const correctWord = room.word;
        if (room.won || room.lost) {
            return;
        }

        if (!fullValidWordList.includes(word.toLowerCase())) {
            socket.emit('badGuess', word);
            return;
        }

        let correctWordCopy = correctWord;
        const newRow = [];
        // lets find the correct ones
        for (let i = 0; i < word.length; i++) {
            if (word[i] === correctWord[i]) {
                correctWordCopy = correctWordCopy.replaceAt(i, '.');
                newRow.push({
                    letter: word[i],
                    status: 'correct'
                });
            } else {
                newRow.push({
                    letter: word[i]
                })
            }
        }

        // lets find the totally wrong ones!
        newRow.forEach((letter) => {
            if (letter.status) {
                return;
            }
            if (!correctWord.includes(letter.letter)) {
                letter.status = 'wrong'
            }
        });

        // lets find the partial ones
        newRow.forEach((letter) => {
            if (letter.status) {
                return;
            }
            if (correctWordCopy.indexOf(letter.letter) >= 0) {
                letter.status = 'partial';
                correctWordCopy = correctWordCopy.replaceAt(correctWordCopy.indexOf(letter.letter), '.');
                console.log(correctWordCopy);
            } else {
                letter.status = 'wrong';
            }

        });

        room.state.push({ tiles: newRow });

        if (correctWord === word) {
            room.won = true;
            io.to(channel).emit('win', room.state.length);
        } else if (room.state.length === 6) {
            room.lost = true;
            io.to(channel).emit('lose', correctWord);
        }
        io.to(channel).emit('gameState', fillGameState(room.state));
        saveRoomsState();
    });
});
