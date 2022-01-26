<template>
  <div>
    <v-row
      align="center"
      justify="center"
      v-for="(row, index) in rows"
      v-bind:key="index"
    >
      <Row :tiles="row.tiles" />
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
  data: () => ({}),
  props: {
    rows: Array,
  },
};
</script>