<template>
  <div>
    <div v-if="showGuess">
      <v-row>
        <div v-for="(n, index) in 5" v-bind:key="index">
          <Tile
            :large="large"
            :mini="mini"
            :letter="guessInput[index]"
            :screen="screen"
          />
        </div>
      </v-row>
    </div>
    <div v-else>
      <v-tooltip right color="primary">
        <template v-slot:activator="{ on, attrs }">
          <v-row v-on="on" v-bind="attrs">
            <div v-for="(gameTile, index) in tiles" v-bind:key="index">
              <Tile
                :mini="mini"
                :letter="gameTile.letter"
                :status="gameTile.status"
                :screen="screen"
                :large="large"
              />
            </div>
          </v-row>
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
