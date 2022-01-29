<template>
  <div
    style="
      max-width: 500px;
      touch-action: manipulation;
      position: fixed;
      bottom: 27px;
      margin: 0 auto;
      left: 0;
      right: 0;
      width: 100%;
    "
    :style="gameState.done ? 'opacity: .1' : ''"
  >
    <v-row class="keyRow" align="center">
      <Key
        @key="handleKeyPress"
        :allGuesses="allGuesses"
        v-for="l in top"
        v-bind:key="l"
        :l="l"
      />
    </v-row>
    <v-row class="keyRowMid">
      <Key
        @key="handleKeyPress"
        :allGuesses="allGuesses"
        v-for="l in middle"
        v-bind:key="l"
        :l="l"
      />
    </v-row>
    <v-row class="keyRow">
      <Key
        @key="handleKeyPress"
        :allGuesses="allGuesses"
        :l="'ENTER'"
        :side="true"
      />
      <Key
        @key="handleKeyPress"
        :allGuesses="allGuesses"
        v-for="l in bottom"
        v-bind:key="l"
        :l="l"
      />
      <Key
        @key="handleKeyPress"
        :allGuesses="allGuesses"
        icon="mdi-backspace-outline"
        :l="'backspace'"
        :side="true"
      />
    </v-row>
  </div>
</template>

<script>
const availableLetters = "abcdefghijklmnopqrstuvwxyz";
import Key from "./Key.vue";
export default {
  name: "VirtualKeyboard",
  components: { Key },
  data: () => ({
    top: "QWERTYUIOP",
    middle: "ASDFGHJKL",
    bottom: "ZXCVBNM",
  }),
  computed: {
    allGuesses() {
      if (!this.gameState || !this.gameState.rows) {
        return [];
      }
      return this.gameState.rows.reduce((a, b) => a.concat(b.tiles), []);
    },
  },
  props: {
    gameState: Object,
    dialogOpen: Boolean,
  },
  created() {
    window.addEventListener("keydown", (e) => {
      if (this.dialogOpen) {
        return;
      }
      if (e.key === "Enter") {
        this.$emit("key", "enter");
        return;
      }
      if (e.key === "Backspace") {
        this.$emit("key", "backspace");
        return;
      }
      if (availableLetters.includes(e.key)) {
        this.$emit("key", e.key.toUpperCase());
      }
    });
    window.touchEnd = function () {
      setTimeout(() => {
        document.querySelectorAll(".keySelected").forEach((el) => {
          console.log(el);
          el.classList.remove("keySelected");
        });
      }, 100);
    };
    window.touchStart = function (e) {
      if (e.target.classList.contains("key")) {
        e.target.classList.add("keySelected");
      }
      if (e.target.parentElement.classList.contains("key")) {
        e.target.parentElement.classList.add("keySelected");
      }
      if (e.target.parentElement.parentElement.classList.contains("key")) {
        e.target.parentElement.parentElement.classList.add("keySelected");
      }
    };
  },
  methods: {
    handleKeyPress(l) {
      this.$emit("key", l);
    },
  },
};
</script>

<style scoped>
.keyRow {
  padding-left: 12px;
  padding-right: 12px;
}
.keyRowMid {
  padding-left: 32px;
  padding-right: 32px;
}
.partial {
  background-color: #b59f3b;
}
.correct {
  background-color: #538d4e;
}
.disabled {
  background-color: black;
  opacity: 0.3;
}
</style>
