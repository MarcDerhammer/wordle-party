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
};

const emitGameState = (roomName) => {
  const room = rooms.find((x) => x.name === roomName);
  if (!room) {
    console.log(room + " not found?!");
    return;
  }
  const payload = {
    rows: fillGameState(room.state),
    state: room.state,
    won: room.won,
    lost: room.lost,
    answerWas: room.answerWas,
    done: room.done,
    message: room.message,
    custom: room.custom,
    username: room.username,
  };

  io.to(roomName).emit("gameState", payload);
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

app.get("/ping", (req, res) => {
  res.send("pong");
});

server.listen(PORT, () => {
  console.log(`Wordle server has started and is listening on ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("A user has connected!");
  socket.on("create", (data) => {
    console.log("Create called with: " + data);
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
    socket.emit("roomCreated", roomName);
    emitGameState(roomName);
    saveRoomsState();
  });
  socket.on("join", (data) => {
    console.log(
      `${socket.username || "[unknown]"} is attempting to join ${data}`
    );
    if (rooms.find((x) => x.name === data)) {
      socket.join(data);
      socket.emit("roomJoined", data);
      emitGameState(data);
      sendRoomCount(data);
      return;
    }
    socket.emit("roomNotFound", "Room not found!");
  });
  socket.on("leave", (data) => {
    console.log(socket.username + " is leaving " + data);
    socket.leave(data);
    socket.emit("roomLeft", data);
    sendRoomCount(data);
  });
  socket.on("setName", (data) => {
    socket.username = data;
    console.log(socket.username + " name set");
  });
  socket.on("newGame", (payload) => {
    const roomName = payload.room;
    console.log(
      "New game called by " + socket.username || "[Unknown]" + " in " + roomName
    );
    const existingRoom = rooms.find((x) => x.name === roomName);
    if (!existingRoom || !existingRoom.done) {
      console.log("Game is not over yet...");
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
    });
    io.to(roomName).emit('newGame');
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
    console.log(
      `${socket.username || "[unknown]"} guessed "${word}" in ${channel}`
    );
    const room = rooms.find((x) => x.name === data.room);
    const correctWord = room.word;
    if (room.won || room.lost || room.done) {
      return;
    }

    if (
      !fullValidWordList.includes(word.toLowerCase()) &&
      word !== correctWord
    ) {
      console.log(`${word} is an invalid guess`);
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
      console.log(`Rate limit.. slow down`);
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

    room.state.push({
      tiles: newRow,
      author: socket.username,
      timestamp: new Date().getTime(),
    });

    if (correctWord === word) {
      room.won = true;
      room.done = true;
      console.log(`${channel} won their game!`);
      io.to(channel).emit("win", room.state.length);
    } else if (room.state.length === 6) {
      room.lost = true;
      room.done = true;
      room.answerWas = correctWord;
      console.log(`${channel} lost their game! (${correctWord})`);
      io.to(channel).emit("lose", correctWord);
    }
    if (room.done) {
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
});
