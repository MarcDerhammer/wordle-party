<template>
  <div
    :style="`position: fixed; bottom: ${keyboardHeight}px; left: 0; width: 100%`"
  >
    <div
      :style="`max-height: ${availableHeight}px; aspect-ratio: ${colCount} / ${rowCount}`"
      style="max-width: 700px; margin: 0 auto; display: flex; flex-wrap: wrap"
    >
      <row
        v-for="(row, index) in rows"
        v-bind:key="index"
        style="flex: 0 100%; display: flex"
        :tiles="row.tiles"
        :screen="screen"
        :guessInput="guessInput"
        :showGuess="firstEmptyIndex === index"
        :author="row.author"
      >
      </row>
    </div>
  </div>
</template>

<script>
import Row from "./Row.vue";
export default {
  name: "Game",
  components: { Row },
  data: () => ({
    keyboardHeight: 200,
  }),
  props: {
    rows: Array,
    guessInput: String,
    screen: Object,
  },
  computed: {
    rowCount() {
      // todo.. in case we ever change guess count or word length
      return 6; // this.gameState.rows.length;
    },
    colCount() {
      // todo: see above
      return 5; // this.gameState.rows[0].tiles.length;
    },
    availableHeight() {
      return this.screen.height - (90 + this.keyboardHeight);
    },
    firstEmptyIndex() {
      return this.rows.findIndex((x) => x.tiles.find((y) => !y.status));
    },
  },
  created() {},
};
</script>

<style scoped></style>
