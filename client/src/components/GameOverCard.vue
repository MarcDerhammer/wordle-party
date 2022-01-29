<template>
  <v-card
    style="
      max-width: 300px;
      position: fixed;
      bottom: 20px;
      margin: 0 auto;
      left: 0;
      right: 0;
      width: 100%;
    "
  >
    <v-card-title v-if="gameState.won">Congratulations!</v-card-title>
    <v-card-title v-else>Game Over!</v-card-title>
    <v-card-text v-if="gameState.lost && gameState.answerWas"
      >The word was <b>{{ gameState.answerWas }}</b></v-card-text
    >
    <v-card-text v-else>Great job, you're a champion! <v-icon color="red">mdi-heart</v-icon></v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="$emit('share')" small
        >Invite Friends<v-icon right>mdi-share</v-icon></v-btn
      >
      <v-spacer />
      <v-btn class="start" color="primary" @click="$emit('newGame')" small>New Game</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "GameOverCard",
  data: () => ({}),
  props: {
    gameState: Object,
  },
};
</script>

<style scoped>
.start {
  animation: blueShadow 2s infinite;
}
@keyframes blueShadow {
  50% {
    box-shadow: 0 0 0 8px #134279;
  }
}
</style>