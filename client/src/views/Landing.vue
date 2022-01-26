<template>
  <div style="margin-top: 20px; text-align: center">
    <v-row v-if="!currentRoom">
      <v-col cols="12" md="6">
        <v-btn @click="$emit('create')" x-large>Host Game</v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn @click="$emit('join')" x-large>Join Game</v-btn>
      </v-col>
    </v-row>
    <div v-else>
      <v-row>
        <v-col cols="12" md="6">
          <v-btn @click="$emit('leave', currentRoom)" small>Leave Room</v-btn>
        </v-col>
        <v-col justify="center" align="center">
          <game :rows="gameState" />
        </v-col>
      </v-row>
      <v-row align="center">
        <v-col justify="center">
          <v-text-field
            clearable
            style="max-width: 420px; margin: auto"
            placeholder="Enter your guess here"
            append-outer-icon="mdi-send"
            @click:append-outer="guess"
            v-model="guessInput"
          ></v-text-field>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import Game from "../components/Game.vue";
export default {
  name: "TopBar",
  components: {
    Game,
  },
  methods: {
    guess() {
      this.$emit("guess", this.guessInput);
    },
  },
  data: () => ({
    guessInput: null,
  }),
  props: {
    currentRoom: String,
    gameState: Array
  },
};
</script>

