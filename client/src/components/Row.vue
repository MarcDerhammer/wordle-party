<template>
  <div>
    <div
      style="display: inline-block; margin: 4px"
      v-for="(gameTile, index) in tiles"
      v-bind:key="index"
    >
      <Tile :letter="gameTile.letter" :status="gameTile.status" />
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
  },
};
</script>