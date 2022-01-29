<template>
  <div
    @click="$emit('key', l)"
    :class="getClass(l) + (side ? ' side' : '')"
    @mousedown="mouseDown"
    @mouseup="mouseOut"
    ontouchend="touchEnd(event)"
    ontouchstart="touchStart(event)"
  >
    <div v-if="icon">
      <v-icon>{{ icon }}</v-icon>
    </div>
    <div v-else>
      {{ l }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Key",
  components: {},
  data: () => ({}),
  props: {
    l: String,
    allGuesses: Array,
    side: Boolean,
    icon: String,
  },
  methods: {
    mouseDown(e) {
      if (e.target.classList.contains("key")) {
        e.target.classList.add("keySelected");
      }
      if (e.target.parentElement.classList.contains("key")) {
        e.target.parentElement.classList.add("keySelected");
      }
      // lmao i'm dumb
      if (e.target.parentElement.parentElement.classList.contains("key")) {
        e.target.parentElement.parentElement.classList.add("keySelected");
      }
    },
    mouseOut(e) {
      setTimeout(() => {
        e.target.classList.remove("keySelected");
        e.target.parentElement.classList.remove("keySelected");
        e.target.parentElement.parentElement.classList.remove("keySelected");
      }, 100);
    },
    getClass(l) {
      if (
        this.allGuesses.find((x) => x.letter === l && x.status === "correct")
      ) {
        return "key correct";
      }
      if (
        this.allGuesses.find((x) => x.letter === l && x.status === "partial")
      ) {
        return "key partial";
      }
      if (this.allGuesses.find((x) => x.letter === l && x.status === "wrong")) {
        return "key disabled";
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
@media (hover: hover) and (pointer: fine) {
  .key:hover {
    background-color: rgb(122, 122, 122);
    box-shadow: 0 0 0 1px white;
  }
}

.key {
  cursor: pointer;
  border-radius: 4px;
  margin: 2px;
  flex: auto;
  height: 50px;
  justify-content: center;
  align-items: center;
  display: flex;
  touch-action: manipulation;
  width: 5px;
  font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
  font-weight: bold;
  font-size: 1.5rem;
  background-color: rgb(78, 78, 78);
}
.keySelected {
  background-color: white !important;
  box-shadow: 0 0 0 7px white !important;
  opacity: 1 !important;
  z-index: 99999;
  color: black;
}
.side {
  width: 13px;
  font-size: 0.6rem !important;
}
</style>
