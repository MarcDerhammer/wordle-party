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
      <v-row
        v-if="width < 1000"
        no-gutters
        style="max-width: 500px; margin: auto"
        justify="center"
      >
        <v-col
          cols="12"
          v-for="(guess, index) in liveGuesses.filter(
            (x) => now - 5000 < x.timestamp
          )"
          v-bind:key="index"
          no-gutters
        >
          <mini-guess
            :name="guess.name"
            :guessInput="guess.guessInput"
            :screen="screen"
          />
        </v-col>
      </v-row>
      <div v-else>
        <div
          style="
            position: fixed;
            top: 90px;
            margin-left: -125px;
            text-align: right;
            width: 600px;
          "
        >
          <v-row
            v-for="(guess, index) in liveGuesses
              .filter((x) => now - 5000 < x.timestamp)
              .sort((a, b) => {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return textA < textB ? -1 : textA > textB ? 1 : 0;
              })"
            v-bind:key="index"
            no-gutters
          >
            <v-col cols="12">
              <mini-guess
                :name="guess.name"
                :guessInput="guess.guessInput"
                large
                :screen="screen"
              />
            </v-col>
          </v-row>
        </div>
        <div style="position: fixed; top: 90px; right: 20px">
          <h1>Join on your phone!</h1>
          <h2>wordle-party.web.app/{{ currentRoom }}</h2>
        </div>
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
    height: window.innerHeight,
    width: window.innerWidth,
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
    window.addEventListener("resize", () => {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
    });
  },
  sockets: {
    liveGuess: function (data) {
      this.liveGuesses = this.liveGuesses.filter((x) => x.id !== data.id);
      if (this.$socket.id !== data.id) {
        this.liveGuesses.unshift(data);
      }
      this.liveGuesses = this.liveGuesses.sort((a, b) => {
        return b.lastChange - a.lastChange;
      });
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
