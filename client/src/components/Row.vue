<template>
  <div>
    <div v-if="showGuess">
      <v-row style="margin-bottom: 15px">
        <div v-for="(n, index) in 5" v-bind:key="index">
          <Tile :letter="guessInput[index]" />
        </div>
      </v-row>
    </div>
    <div v-else>
      <v-row style="margin-bottom: 15px">
        <div v-for="(gameTile, index) in tiles" v-bind:key="index">
          <Tile :letter="gameTile.letter" :status="gameTile.status" />
        </div>
      </v-row>
    </div>
  </div>
</template>

<script>
import Tile from "./Tile.vue";
export default {
  name: "Row",
  components: {
    Tile,
  },
  data: () => ({}),
  props: {
    tiles: Array,
    guessInput: String,
    showGuess: Boolean,
  },
};
</script>

<style scoped></style>
