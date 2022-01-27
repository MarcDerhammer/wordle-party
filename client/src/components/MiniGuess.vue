<template>
  <div>
    <v-row no-gutters align="center" justify="center">
      <v-col cols="6" style="text-align: right; padding-right: 20px">
        {{ name }}:
      </v-col>
      <v-col cols="6">
        <row
          style="margin-top: 3px"
          :guessInput="guessInput"
          :showGuess="true"
          mini
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
  },
};
</script>

<style scoped></style>
