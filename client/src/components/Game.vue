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
        :author="row.author"
        :screen="screen"
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
  data: () => ({
    height: window.screen.availHeight,
    width: window.screen.availWidth
  }),
  props: {
    rows: Array,
    guessInput: String
  },
  computed: {
    firstEmptyIndex() {
      return this.rows.findIndex((x) => x.tiles.find((y) => !y.status));
    },
    screen() {
      return {
        height: this.height,
        width: this.width
      }
    }
  },
  created() {
    window.addEventListener('resize', () => {
      this.height = window.screen.availHeight;
      this.width = window.screen.availWidth;
    })
  }
};
</script>
