<template>
  <div>
    <div v-if="showGuess">
      <v-row>
        <div v-for="(n, index) in 5" v-bind:key="index">
          <Tile :mini="mini" :letter="guessInput[index]" />
        </div>
      </v-row>
    </div>
    <div v-else>
      <v-row>
        <div v-for="(gameTile, index) in tiles" v-bind:key="index">
          <Tile
            :mini="mini"
            :letter="gameTile.letter"
            :status="gameTile.status"
          />
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
    mini: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
