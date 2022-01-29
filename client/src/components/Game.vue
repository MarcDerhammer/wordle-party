<template>
  <div>
    <div
      no-gutters
      v-for="(row, index) in rows"
      v-bind:key="index"
    >
      <Row
        :showGuess="firstEmptyIndex === index"
        :tiles="row.tiles"
        :guessInput="guessInput"
        :author="row.author"
        :screen="screen"
      />
    </div>
  </div>
</template>

<script>
import Row from "./Row.vue";
export default {
  name: "Game",
  components: {
    Row,
  },
  data: () => ({}),
  props: {
    rows: Array,
    guessInput: String,
    screen: Object,
  },
  computed: {
    firstEmptyIndex() {
      return this.rows.findIndex((x) => x.tiles.find((y) => !y.status));
    },
  },
  created() {},
};
</script>
