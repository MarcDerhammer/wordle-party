const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const words = require("./words.json");
const validWords = require("./validWords.json");
const fullValidWordList = words.concat(validWords);
const fs = require("fs");
const config = require("./config");
const cors = require('cors');
const requestIp = require('request-ip');

const io = new Server(server, {
  cors: {
    origin: config.origins,
    credentials: true,
  },
});

let rooms = [];
if (fs.existsSync("./rooms.json")) {
  rooms = require("./rooms.json");
}

const socketLog = (socket, room, message) => {
  const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log(`[${room ? room : '....'}] (${socket.username ? socket.username : ''}) ${message} (${ip})`);
}

const saveRoomsState = () => {
  fs.writeFileSync("./rooms.json", JSON.stringify(rooms));
};
const sendRoomCount = (roomName) => {
  if (!roomName) {
    return;
  }
  const room = io.sockets.adapter.rooms.get(roomName);
  if (!room) {
    return;
  }
  io.to(roomName).emit("roomCount", room.size || 0);
  sendRoomList(roomName);
};
const getRoomList = (roomName) => {
  if (!roomName) {
    return;
  }
  const room = io.sockets.adapter.rooms.get(roomName);
  if (!room) {
    return;
  }
  let names = [];
  for (const client of room) {
    s = io.sockets.sockets.get(client);
    names.push(s.username || 'Unknown');
  }
  return names;
};
const sendRoomList = (roomName) => {
  const list = getRoomList(roomName);
  if (list) {
    io.to(roomName).emit("roomList", list);
  }
}

const buildPayload = (room) => {
  if (room.message) {
    room.message = room.message.trim()
  }
  return {
    rows: fillGameState(room.state),
    state: room.state,
    won: room.won,
    lost: room.lost,
    answerWas: room.answerWas,
    done: room.done,
    message: room.message,
    custom: room.custom,
    username: room.username,
    hardMode: room.hardMode
  };
}

const emitGameState = (roomName) => {
  const room = rooms.find((x) => x.name === roomName);
  if (!room) {
    return;
  }

  io.to(roomName).emit("gameState", buildPayload(room));
};

const fillGameState = (existingState) => {
  const state = JSON.parse(JSON.stringify(existingState));
  for (let i = state.length; i < 6; i++) {
    let row = {};
    row.tiles = [];
    for (let j = 0; j < 5; j++) {
      row.tiles.push({
        letter: "",
      });
    }
    state.push(row);
  }
  return state;
};

const PORT = config.port;

const getUnusedRoomCode = () => {
  let roomCode = getRoomCode(4);
  while (rooms.find((x) => x.name === roomCode)) {
    roomCode = getRoomCode(4);
  }
  return roomCode;
};

const getRoomCode = (length) => {
  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
};

function getRandomWord() {
  return words[Math.round(Math.random() * (words.length - 1))].toUpperCase();
}

String.prototype.replaceAt = function (index, replacement) {
  if (index >= this.length) {
    return this.valueOf();
  }

  return this.substring(0, index) + replacement + this.substring(index + 1);
};

app.use(cors({
  origin: config.origins
}))

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/history", (req, res) => {
  const clientIp = requestIp.getClientIp(req);
  console.log(`${clientIp} : /history : ` + req.query.room);
  if (!req.query.room) {
    res.status(404);
    res.send('no');
    return;
  }
  const room = req.query.room;
  if (fs.existsSync(`./history/${room}.json`)) {
    const json = require(`./history/${room}.json`);
    res.send(json);
    return;
  }
  res.status(404);
  res.send('no');
});

server.listen(PORT, () => {
  console.log(`Wordle server has started and is listening on ${PORT}`);
});

io.on("connection", (socket) => {
  socketLog(socket, null, "A user has connected");
  socket.on("create", (data) => {
    const roomName = getUnusedRoomCode();
    rooms = rooms.filter((x) => x.name != roomName);
    rooms.push({
      name: roomName,
      state: [],
      word: getRandomWord(),
      startTime: new Date().getTime(),
      custom: data.word !== undefined && data.word !== '',
      message: data.message,
      username: socket.username,
    });
    socketLog(socket, roomName, "New room created!");
    socket.emit("roomCreated", roomName);
    emitGameState(roomName);
    saveRoomsState();
  });
  socket.on("join", (data) => {
    socketLog(socket, null, "Attempting to join " + data)
    if (rooms.find((x) => x.name === data)) {
      socket.join(data);
      socket.emit("roomJoined", data);
      emitGameState(data);
      sendRoomCount(data);
      return;
    }
    socketLog(socket, null, "Room was not found! " + data);
    socket.emit("roomNotFound", "Room not found!");
  });
  socket.on("leave", (data) => {
    socketLog(socket, data, "User leaving room")
    socket.leave(data);
    socket.emit("roomLeft", data);
    sendRoomCount(data);
  });
  socket.on("disconnect", () => {
    socketLog(socket, null, "User Disconnected")
  });
  socket.on("setName", (data) => {
    let version = "unknown"
    if (typeof data === "string") {
      socket.username = data.trim();
    } else {
      socket.username = data.name.trim();
      version = data.version;
    }

    socketLog(socket, null, `Name set. [${version}]`)
  });
  socket.on("newGame", (payload) => {
    const roomName = payload.room;
    socketLog(socket, roomName, "Called new game!");
    const existingRoom = rooms.find((x) => x.name === roomName);
    if (!existingRoom || !existingRoom.done) {
      socketLog(socket, roomName, "Game is not over yet! Returning..");
      return;
    }

    rooms = rooms.filter((x) => x.name != roomName);
    rooms.push({
      name: roomName,
      state: [],
      word: payload.word || getRandomWord(),
      startTime: new Date().getTime(),
      custom: payload.word !== undefined && payload.word !== "",
      message: payload.message,
      username: socket.username,
      hardMode: payload.hardMode
    });
    io.to(roomName).emit('newGame', buildPayload(rooms.find(x => x.name === roomName)));
    emitGameState(roomName);
    saveRoomsState();
  });
  socket.on("typing", (data) => {
    const room = data.room;
    if (data.guessInput !== socket.lastGuessInput) {
      socket.lastChange = new Date().getTime();
    }
    socket.lastGuessInput = data.guessInput;
    const input = data.guessInput;
    socket.lastGuessInput = data.guessInput;
    io.to(room).emit("liveGuess", {
      id: socket.id,
      name: socket.username || "Someone",
      guessInput: input,
      timestamp: new Date().getTime(),
      lastChange: socket.lastChange || new Date().getTime(),
    });
  });
  socket.on("guess", (data) => {
    const word = data.word.toUpperCase().trim().substring(0, 5);
    const channel = data.room;
    socketLog(socket, channel, `guessed "${word}"`);
    const room = rooms.find((x) => x.name === data.room);
    const correctWord = room.word;
    if (room.won || room.lost || room.done) {
      return;
    }

    if (
      !fullValidWordList.includes(word.toLowerCase()) &&
      word !== correctWord
    ) {
      socketLog(socket, data.room, `Invalid guess "${word}"`);
      socket.emit("badGuess", word);
      return;
    }

    const MILLISECONDS_BETWEEN_GUESSES = 3000;

    if (
      room.state.find(
        (x) => new Date().getTime() - x.timestamp < MILLISECONDS_BETWEEN_GUESSES
      )
    ) {
      // TOO FAST
      socketLog(socket, data.room, "Rate limited...");
      socket.emit("tooFast", word);
      return;
    }

    let correctWordCopy = correctWord;
    const newRow = [];
    // lets find the correct ones
    for (let i = 0; i < word.length; i++) {
      if (word[i] === correctWord[i]) {
        correctWordCopy = correctWordCopy.replaceAt(i, ".");
        newRow.push({
          letter: word[i],
          status: "correct",
        });
      } else {
        newRow.push({
          letter: word[i],
        });
      }
    }

    // lets find the totally wrong ones!
    newRow.forEach((letter) => {
      if (letter.status) {
        return;
      }
      if (!correctWord.includes(letter.letter)) {
        letter.status = "wrong";
      }
    });

    // lets find the partial ones
    newRow.forEach((letter) => {
      if (letter.status) {
        return;
      }
      if (correctWordCopy.indexOf(letter.letter) >= 0) {
        letter.status = "partial";
        correctWordCopy = correctWordCopy.replaceAt(
          correctWordCopy.indexOf(letter.letter),
          "."
        );
      } else {
        letter.status = "wrong";
      }
    });

    if (room.hardMode && room.state.length > 0) {
      // ok first let's make sure the greens stayed green
      const lastRow = room.state[room.state.length - 1].tiles;
      for (let i = 0; i < correctWord.length; i++) {
        if (lastRow[i].status === 'correct' && newRow[i].letter !== lastRow[i].letter) {
          socket.emit("badGuessHardGreen", word);
          socketLog(socket, data.room, "Hard mode rule: Didn't use same green " + newRow[i].letter)
          return;
        }
      }
      // ok now let's make sure all the partials were re-used...
      let newWordCopy = word;
      let partials = lastRow.filter(x => x.status === 'partial');
      for (let i = 0; i < partials.length; i++) {
        if (!newWordCopy.includes(partials[i].letter)) {
          socket.emit("badGuessHardYellow", word);
          socketLog(socket, data.room, "Hard mode rule: Didn't use a yellow " + partials[i].letter);
          return;
        }
        newWordCopy.replace(partials[i].letter, '.');
      }
    }

    room.state.push({
      tiles: newRow,
      author: socket.username,
      timestamp: new Date().getTime(),
    });

    if (correctWord === word) {
      room.won = true;
      room.done = true;
      socketLog(socket, channel, "Game was won!");
      io.to(channel).emit("win", room.state.length);
    } else if (room.state.length === 6) {
      room.lost = true;
      room.done = true;
      room.answerWas = correctWord;
      socketLog(socket, channel, `Game lost! (${correctWord})`);
      io.to(channel).emit("lose", correctWord);
    }
    if (room.done) {
      room.finishTime = new Date().getTime();
      let history = [];
      if (!fs.existsSync("./history")) {
        fs.mkdirSync("./history");
      }
      if (fs.existsSync(`./history/${room.name}.json`)) {
        history = require(`./history/${room.name}.json`);
      }
      history.push(room);
      fs.writeFileSync(`./history/${room.name}.json`, JSON.stringify(history));
    }
    emitGameState(channel);
    saveRoomsState();
  });
  socket.on("roomCount", (data) => {
    if (!data) {
      return;
    }
    const room = io.sockets.adapter.rooms.get(data);
    if (!room) {
      return;
    }
    socket.emit("roomCount", room.size || 0);
  });
  socket.on("roomList", (data) => {
    const roomList = getRoomList(data);
    if (roomList) {
      socket.emit("roomList", roomList);
    }
  });
});
