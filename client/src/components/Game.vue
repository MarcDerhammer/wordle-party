<template>
  <div style="position: fixed; bottom: 180px; left: 0; width: 100%">
    <div
      :style="`max-height: ${availableHeight}px; aspect-ratio: ${colCount} / ${rowCount}`"
      style="
        bottom: 180px;
        max-width: 700px;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
      "
    >
      <row
        v-for="(row, index) in rows"
        v-bind:key="index"
        style="flex: 0 100%; display: flex"
        :tiles="row.tiles"
        :screen="screen"
        :guessInput="guessInput"
        :showGuess="firstEmptyIndex === index"
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
  data: () => ({}),
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
      return this.screen.height - (48 + 189);
    },
    firstEmptyIndex() {
      return this.rows.findIndex((x) => x.tiles.find((y) => !y.status));
    },
  },
  created() {},
};
</script>

<style scoped></style>
