<template>
  <div>
    <div style="display: flex; flex: 0 100%" v-if="showGuess">
      <div
        v-for="(tile, index) in tiles"
        v-bind:key="index"
        style="flex: 1; padding: 3px"
      >
        <Tile
          :large="large"
          :mini="mini"
          :letter="guessInput[index]"
          :screen="screen"
        />
      </div>
    </div>
    <div style="display: flex; flex: 0 100%" v-else>
      <div
        v-for="(tile, index) in tiles"
        v-bind:key="index"
        style="flex: 1; padding: 3px"
      >
        <v-tooltip right color="primary">
          <template v-slot:activator="{ on, attrs }">
            <Tile
              v-on="on"
              v-bind="attrs"
              :mini="mini"
              :letter="tile.letter"
              :status="tile.status"
              :screen="screen"
              :large="large"
            />
          </template>
          <v-chip v-if="author" class="ma-1" color="primary" pill>
            <v-icon left> mdi-account-outline </v-icon>
            {{ author }}
          </v-chip>
        </v-tooltip>
      </div>
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
  methods: {
    lookupLetter(index) {
      return this.tiles[index].letter || `&nbsp`;
    },
  },
  data: () => ({
    emptyStr: "dd",
  }),
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
  },
};
</script>

<style scoped></style>
