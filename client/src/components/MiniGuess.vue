<template>
  <div>
    <div>
      <v-row justify="center">
        <v-col>{{ name }}: </v-col>
        <v-col style="white-space: nowrap">
          <tile
            v-for="(tile, index) in tiles"
            v-bind:key="index"
            :guessInput="guessInput"
            :showGuess="true"
            style="
              display: inline-block;
              text-align: center;
              white-space: nowrap;

            "
            mini
            :letter="tile.letter"
            status="mini"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import Tile from "./Tile.vue";
export default {
  name: "MiniGuess",
  components: {
    Tile,
  },
  data: () => ({}),
  props: {
    guessInput: String,
    name: String,
  },
  computed: {
    tiles() {
      const tiles = [];
      const inputPadded = this.guessInput.padEnd(5, " ");
      for (let i = 0; i < inputPadded.length; i++) {
        tiles.push({
          letter: inputPadded[i],
          status: "",
        });
      }
      return tiles;
    },
  },
};
</script>

<style scoped></style>
