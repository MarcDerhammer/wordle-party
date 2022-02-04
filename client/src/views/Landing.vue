<template>
  <div style="text-align: center">
    <v-row
      align="center"
      justify="center"
      style="max-width: 800px; margin: auto"
      v-if="!currentRoom"
    >
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="$emit('create')" x-large>New Room</v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="$emit('join')" x-large>Join Room</v-btn>
      </v-col>
      <v-col cols="12">
        <About />
      </v-col>
    </v-row>
    <div v-else>
      <div v-if="!history">
        <Game
          :screen="screen"
          :rows="gameState.rows"
          :guessInput="guessInput"
        />
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
      <div v-else>
        <history @back="$emit('back')" :screen="screen" :room="currentRoom" />
      </div>
    </div>
    <div
      v-if="liveGuesses.filter((x) => this.now - x.lastChange < 10000).length"
      style="
        position: fixed;
        top: 48px;
        margin: 0 auto;
        left: 4px;
        z-index: 1000;
        max-width: 300px;
        border-radius: 4px;
        padding: 5px;
        background-color: grey;
        opacity: 0.7;
      "
    >
      <v-row
        no-gutters
        v-for="(guess, index) in liveGuesses.filter(
          (x) => this.now - x.lastChange < 10000
        )"
        v-bind:key="index"
        style="border-radius: 8px"
      >
        <v-col>
          <mini-guess :guessInput="guess.guessInput" :name="guess.name" />
        </v-col>
      </v-row>
    </div>

    <v-snackbar style="z-index: 1001" app top v-model="snackbar">
      {{ text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar style="z-index: 1001" v-model="alert" top app>
      <div v-if="gameState.hardMode">
        <b style="color: red">HARD MODE IS ON!</b>
      </div>
      <div v-if="gameState.custom">
        Custom word chosen by <b>{{ gameState.username }}</b>
      </div>
      <div v-else>This is a <b>random</b> word!</div>
      <div v-if="gameState.message">
        <b>{{ gameState.username }}</b> says "{{ gameState.message }}"
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="alert = false">
          hide
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar style="z-index: 1001" timeout="2000" v-model="showConnections" top app>
      <div v-if="roomCount == 1">
        There is <b>1</b> user connected to {{ currentRoom }}
      </div>
      <div v-else>
        There are <b>{{ roomCount }}</b> users connected to {{ currentRoom }}
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="showConnections = false"
        >
          hide
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
import History from './History.vue';

export default {
  name: "TopBar",
  components: {
    Game,
    VirtualKeyboard,
    GameOverCard,
    MiniGuess,
    About,
    History,
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
    showInfoToast() {
      this.alert = true;
    },
    showConnectionInfo() {
      this.showConnections = true;
    },
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
    alert: false,
    showConnections: false,
    guessInterval: null,
  }),
  props: {
    currentRoom: String,
    gameState: Object,
    dialogOpen: Boolean,
    roomCount: String,
    history: Boolean,
  },
  created() {
    this.guessInterval = setInterval(() => {
      this.now = new Date().getTime();
      if (this.guessInput) {
        this.emitTyping();
      }
    }, 3000);
    window.addEventListener("resize", () => {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
    });
  },
  destroyed() {
    clearInterval(this.guessInterval);
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
      if (navigator && navigator.vibrate) {
        navigator.vibrate([200, 50, 200]);
      }
    },
    badGuessHardYellow: function (word) {
      this.snackbar = true;
      this.text = `Hard mode is enabled! You must re-use all yellows!`;
      this.guessInput = word;
      if (navigator && navigator.vibrate) {
        navigator.vibrate([200, 50, 200]);
      }
    },
    badGuessHardGreen: function (word) {
      this.snackbar = true;
      this.text = `Hard mode is enabled! You must keep the greens!`;
      this.guessInput = word;
      if (navigator && navigator.vibrate) {
        navigator.vibrate([200, 50, 200]);
      }
    },
    tooFast: function (word) {
      this.snackbar = true;
      this.text = `Slow down!  You're guessing too fast!`;
      this.guessInput = word;
    },
    win: function () {},
    lose: function () {},
    newGame: function (payload) {
      // todo... better here.
      if (payload.custom || payload.message || payload.hardMode) {
        this.alert = true;
      }
      this.guessInput = "";
    },
  },
};
</script>
