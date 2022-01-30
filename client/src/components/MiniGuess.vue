<template>
  <div>
    <v-row no-gutters align="center" justify="center">
      <v-col
        cols="6"
        style="text-align: right; padding-right: 32px; white-space: nowrap"
      >
        <h3 v-if="large">{{ name }}:</h3>
        <div v-else>{{ name }}:</div>
      </v-col>
      <v-col cols="6">
        <row
          style="margin-top: 3px"
          :guessInput="guessInput"
          :showGuess="true"
          mini
          :large="large"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Row from "./Row.vue";
export default {
  name: "MiniGuess",
  components: {
    Row,
  },
  data: () => ({}),
  props: {
    guessInput: String,
    name: String,
    large: Boolean,
  },
};
</script>

<style scoped></style>
