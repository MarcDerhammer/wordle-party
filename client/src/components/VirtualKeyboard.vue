<template>
  <div style="max-width: 500px; margin: auto; touch-action: manipulation">
    <v-row class="keyRow" align="center">
      <div
        @click="$emit('key', l)"
        :class="getClass(l)"
        v-for="l in top"
        v-bind:key="l"
      >
        {{ l }}
      </div>
    </v-row>
    <v-row class="keyRowMid">
      <div
        @click="$emit('key', l)"
        class="key"
        :class="getClass(l)"
        v-for="l in middle"
        v-bind:key="l"
      >
        {{ l }}
      </div>
    </v-row>
    <v-row class="keyRow">
      <div @click="$emit('key', 'enter')" class="key" style="max-width: 60px">
        ENTER
      </div>
      <div
        @click="$emit('key', l)"
        class="key"
        :class="getClass(l)"
        v-for="l in bottom"
        v-bind:key="l"
      >
        {{ l }}
      </div>
      <div @click="$emit('key', 'backspace')" class="key">
        <v-icon>mdi-backspace-outline</v-icon>
      </div>
    </v-row>
  </div>
</template>

<script>
const availableLetters = "abcdefghijklmnopqrstuvwxyz";
export default {
  name: "VirtualKeyboard",
  components: {},
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
  },
  methods: {
    getClass(l) {
      if (
        this.allGuesses.find((x) => x.letter === l && x.status === "correct")
      ) {
        return "key green";
      }
      if (
        this.allGuesses.find((x) => x.letter === l && x.status === "partial")
      ) {
        return "key yellow";
      }
      if (this.allGuesses.find((x) => x.letter === l && x.status === "wrong")) {
        return "key black";
      }
      return "key";
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
.key {
  cursor: pointer;
  border-radius: 4px;
  background-color: rgb(70, 70, 70) !important;
  margin: 2px;
  flex: auto;
  height: 35px;
  justify-content: center;
  align-items: center;
  display: flex;
  touch-action: manipulation;
}
.yellow {
  background-color: rgb(134, 113, 45) !important;
}
.green {
  background-color: rgb(34, 87, 23) !important;
}
.black {
  background-color: black !important;
  opacity: 0.2;
}
</style>
