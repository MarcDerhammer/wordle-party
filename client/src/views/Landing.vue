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
      <v-tooltip
        absolute
        transition="expand"
        top
        :allow-overflow="false"
        v-model="showLive"
        style="text-align: right"
      >
        <template v-slot:activator="{ on, attrs }">
          <Game
            v-on="on"
            v-bind="attrs"
            :screen="screen"
            :rows="gameState.rows"
            :guessInput="guessInput"
          />
        </template>
        <mini-guess
          v-for="(guess, index) in liveGuesses"
          v-bind:key="index"
          :guessInput="guess.guessInput"
          :name="guess.name"
        />
      </v-tooltip>
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
import VirtualKeyboard from "../components/VirtualKeyboard.vue";
import GameOverCard from "../components/GameOverCard.vue";
import MiniGuess from "../components/MiniGuess.vue";

export default {
  name: "TopBar",
  components: {
    Game,
    VirtualKeyboard,
    GameOverCard,
    MiniGuess,
  },
  computed: {
    rows() {
      // todo.. in case we ever change guess count or word length
      return 6; // this.gameState.rows.length;
    },
    cols() {
      // todo: see above
      return 5; // this.gameState.rows[0].tiles.length;
    },
    availableWidth() {
      return Math.min(this.screen.width, 500);
    },
    availableHeight() {
      return this.screen.height - (48 + 189);
    },
    screen() {
      return {
        height: this.height,
        width: this.width,
      };
    },
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
    height: window.innerHeight,
    width: window.innerWidth,
    showLive: false,
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
      this.liveGuesses = this.liveGuesses.filter(
        (x) => this.now - x.timestamp < 8000
      );
      if (!this.liveGuesses.length) {
        this.showLive = false;
      }
    }, 3000);
    window.addEventListener("resize", () => {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
    });
  },
  sockets: {
    liveGuess: function (data) {
      this.liveGuesses = this.liveGuesses.filter((x) => x.id !== data.id);
      if (this.$socket.id !== data.id && data.guessInput) {
        this.liveGuesses.unshift(data);
      }
      this.liveGuesses = this.liveGuesses.sort((a, b) => {
        return b.lastChange - a.lastChange;
      });
      if (this.liveGuesses.length === 0) {
        this.showLive = false;
      } else {
        this.showLive = true;
      }
    },
    badGuess: function (word) {
      this.snackbar = true;
      this.text = `"${word}" is not in the valid word list!`;
      this.guessInput = word;
    },
    tooFast: function (word) {
      this.snackbar = true;
      this.text = `Slow down!  You're guessing too fast!`;
      this.guessInput = word;
    },
    win: function () {
    },
    lose: function () {
    },
  },
};
</script>
