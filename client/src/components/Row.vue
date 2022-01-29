<template>
  <div>
    <div style="display: flex; flex-wrap: no-wrap" v-if="showGuess">
      <Tile
        v-for="(n, index) in 5"
        v-bind:key="index"
        :large="large"
        :mini="mini"
        :letter="guessInput[index]"
        :screen="screen"
      />
    </div>
    <div style="display: flex; flex-wrap: no-wrap" v-else>
      <v-tooltip right color="primary">
        <template v-slot:activator="{ on, attrs }">
          <Tile
            v-on="on"
            v-bind="attrs"
            v-for="(gameTile, index) in tiles"
            v-bind:key="index"
            :mini="mini"
            :letter="gameTile.letter"
            :status="gameTile.status"
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
