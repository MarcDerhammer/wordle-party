<template>
  <div>
    <v-row
      align="center"
      justify="center"
      v-for="(row, index) in rows"
      v-bind:key="index"
    >
      <Row
        :showGuess="firstEmptyIndex === index"
        :tiles="row.tiles"
        :guessInput="guessInput"
      />
    </v-row>
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
  },
  computed: {
    firstEmptyIndex() {
      return this.rows.findIndex((x) => x.tiles.find((y) => !y.status));
    },
  },
};
</script>
