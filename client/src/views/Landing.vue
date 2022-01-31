<template>
  <div style="text-align: center">
    <v-row
      align="center"
      justify="center"
      style="max-width: 800px; margin: auto"
      v-if="!currentRoom"
    >
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="$emit('create')" x-large>New Game</v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="$emit('join')" x-large>Join Game</v-btn>
      </v-col>
      <v-col cols="12">
        <About />
      </v-col>
    </v-row>
    <div v-else>
      <v-alert
        v-model="alert"
        type="info"
        style="max-width: 700px; margin: auto; opacity: 0.7; z-index: 999"
        v-if="gameState.custom || gameState.message"
        dense
        dismissible
      >
        <div v-if="gameState.custom">
          Custom word chosen by <b>{{ gameState.username }}</b>
        </div>
        <div v-else>
          Random word
        </div>
        <div v-if="gameState.message">
          <b>{{ gameState.username }}</b> says "{{ gameState.message }}"
        </div>
      </v-alert>
      <Game :screen="screen" :rows="gameState.rows" :guessInput="guessInput" />
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
    <div
      v-if="liveGuesses.length"
      style="
        position: fixed;
        top: 48px;
        margin: 0 auto;
        left: 4px;
        z-index: 9999;
        max-width: 300px;
        border-radius: 4px;
        padding: 5px;
        background-color: grey;
        opacity: 0.7;
      "
    >
      <v-row
        no-gutters
        v-for="(guess, index) in liveGuesses"
        v-bind:key="index"
        style="border-radius: 8px"
      >
        <v-col>
          <mini-guess :guessInput="guess.guessInput" :name="guess.name" />
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
import VirtualKeyboard from "../components/VirtualKeyboard.vue";
import GameOverCard from "../components/GameOverCard.vue";
import MiniGuess from "../components/MiniGuess.vue";
import About from "../components/About.vue";

export default {
  name: "TopBar",
  components: {
    Game,
    VirtualKeyboard,
    GameOverCard,
    MiniGuess,
    About,
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
    alert: true
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
        (x) => this.now - x.lastChange < 10000
      );
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
    win: function () {},
    lose: function () {},
    newGame: function() {
      this.alert = true;
      this.guessInput = '';
    }
  },
};
</script>
