<template>
  <div style="margin-top: 20px; text-align: center">
    <v-row v-if="!currentRoom">
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="$emit('create')" x-large>New Game</v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="$emit('join')" x-large>Join Game</v-btn>
      </v-col>
    </v-row>
    <div v-else>
      <v-row justify="center">
        <v-col
          style="margin-top: 12px"
          cols="12"
          justify="center"
          align="center"
        >
          <game :rows="gameState.rows" :guessInput="guessInput" />
        </v-col>
      </v-row>
      <v-row v-if="false" align="center">
        <v-col justify="center">
          <v-text-field
            clearable
            style="max-width: 420px; margin: auto"
            placeholder="Enter your guess here"
            append-outer-icon="mdi-send"
            @click:append-outer="guess"
            v-model="guessInput"
            @keyup.enter="guess"
            @input="checkInput"
          ></v-text-field>
        </v-col>
      </v-row>
      <div>
        <virtual-keyboard
          :dialogOpen="dialogOpen"
          @key="handleVKeyboardPress"
          :gameState="gameState"
        />
      </div>
      <div>
        <GameOverCard
          @newGame="$emit('newGame', currentRoom)"
          @share="share"
          v-if="gameState.done"
          :gameState="gameState"
        />
      </div>
      <v-row style="max-width: 500px; margin: auto" justify="center">
        <v-col cols="6">
          <mini-guess
            v-for="(guess, index) in liveGuesses.filter(
              (x) => now - 5000 < x.timestamp
            )"
            v-bind:key="index"
            :name="guess.name"
            :guessInput="guess.guessInput"
          />
        </v-col>
      </v-row>
    </div>
    <v-snackbar top v-model="snackbar">
      {{ text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import Game from "../components/Game.vue";
import MiniGuess from "../components/MiniGuess.vue";
import VirtualKeyboard from "../components/VirtualKeyboard.vue";
import GameOverCard from "../components/GameOverCard.vue";

export default {
  name: "TopBar",
  components: {
    Game,
    VirtualKeyboard,
    MiniGuess,
    GameOverCard,
  },
  methods: {
    share() {
      this.$emit("share");
    },
    emitTyping() {
      this.$socket.emit("typing", {
        guessInput: this.guessInput,
        room: this.currentRoom,
      });
    },
    handleVKeyboardPress(key) {
      if (key === "backspace") {
        this.guessInput = this.guessInput.substring(
          0,
          this.guessInput.length - 1
        );
        this.emitTyping();
        return;
      }
      if (key.toLowerCase() === "enter") {
        this.guess();
        this.guessInput = "";
        this.emitTyping();
        return;
      }
      if (this.guessInput.length >= 5) {
        return;
      }
      this.guessInput += key;
      this.emitTyping();
    },
    checkInput() {
      if (this.guessInput && this.guessInput.length > 5) {
        this.guessInput = this.guessInput.substring(0, 5);
      }
    },
    guess() {
      const regex = new RegExp(/^[a-z0-9]+$/i);
      this.guessInput = this.guessInput.trim();
      if (
        !regex.test(this.guessInput) ||
        !this.guessInput ||
        this.guessInput.length !== 5
      ) {
        this.text = "Invalid input!";
        this.guessInput = "";
        this.snackbar = true;
        return;
      }
      this.$emit("guess", this.guessInput.trim());
      this.guessInput = "";
    },
  },
  data: () => ({
    guessInput: "",
    snackbar: false,
    text: "",
    liveGuesses: [],
    now: new Date().getTime(),
  }),
  props: {
    currentRoom: String,
    gameState: Object,
    dialogOpen: Boolean,
  },
  created() {
    setInterval(() => {
      this.now = new Date().getTime();
      if (this.guessInput) {
        this.emitTyping();
      }
    }, 1000);
  },
  sockets: {
    liveGuess: function (data) {
      this.liveGuesses = this.liveGuesses.filter((x) => x.id !== data.id);
      if (this.$socket.id !== data.id && data.guessInput) {
        this.liveGuesses.unshift(data);
      }
    },
    badGuess: function (word) {
      this.snackbar = true;
      this.text = `"${word}" is not in the valid word list!`;
    },
    win: function (count) {
      this.snackbar = true;
      switch (count) {
        case 1:
          this.text = "NO FUCKING WAY";
          break;
        case 2:
          this.text = "Amazing";
          break;
        case 3:
          this.text = "Wicked!";
          break;
        case 4:
          this.text = "Nice job";
          break;
        case 5:
          this.text = "You did it!";
          break;
        case 6:
          this.text = "Nice, that was close!";
          break;
      }
    },
    lose: function (word) {
      this.snackbar = true;
      this.text = `Aw you suck, the word was "${word}"`;
    },
  },
};
</script>
