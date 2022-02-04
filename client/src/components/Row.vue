<template>
  <div>
    <v-tooltip right>
      <template v-slot:activator="{ on, attrs }">
        <div v-on="on" style="display: flex; flex: 0 100%" v-if="showGuess">
          <div
            v-for="(tile, index) in tiles"
            v-bind:key="index"
            style="flex: 1; padding: 3px"
          >
            <Tile
              :mini="mini"
              :letter="guessInput[index]"
              :screen="screen"
            />
          </div>
        </div>
        <div
          v-on="on"
          v-bind="attrs"
          style="display: flex; flex: 0 100%"
          v-else
        >
          <div
            v-for="(tile, index) in tiles"
            v-bind:key="index"
            style="flex: 1; padding: 3px"
          >
            <Tile
              :mini="mini"
              :letter="tile.letter"
              :status="tile.status"
              :screen="screen"
              :large="large"
              :history="history"
            />
          </div>
        </div>
      </template>
      <div>
        <v-icon>mdi-account</v-icon><span>{{ author || "..." }}</span>
      </div>
    </v-tooltip>
  </div>
</template>

<script>
import Tile from "./Tile.vue";
export default {
  name: "Row",
  components: {
    Tile,
  },
  methods: {
    lookupLetter(index) {
      return this.tiles[index].letter || `&nbsp`;
    },
  },
  data: () => ({}),
  props: {
    tiles: Array,
    guessInput: String,
    showGuess: Boolean,
    author: String,
    mini: {
      type: Boolean,
      default: false,
    },
    screen: Object,
    large: Boolean,
    history: Boolean
  },
};
</script>

<style scoped></style>
