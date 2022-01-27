<template>
  <v-card>
    <v-card-title>New Game Options</v-card-title>
    <v-card-text>
      <v-switch v-model="randomWord" label="Random word" />
      <v-text-field
        v-if="!randomWord"
        :type="showPassword ? 'text' : 'password'"
        v-model="newWord"
        label="Type your word (must be 5 characters)"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append="showPassword = !showPassword"
        @input="newWord = newWord.toUpperCase()"
        @keyup.enter="trySubmit"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn @click="$emit('close')">Close</v-btn>
      <v-spacer />
      <v-btn
        @click="$emit('start', randomWord ? '' : newWord)"
        :disabled="!randomWord && newWord.length !== 5"
        color="primary"
        >Start!</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
const validLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default {
  name: "NewGameOptions",
  components: {},
  data: () => ({
    randomWord: true,
    newWord: "",
    showPassword: false,
  }),
  props: {},
  methods: {
    trySubmit() {
      if (this.newWord && this.newWord.length === 5) {
        this.newWord = this.newWord.toUpperCase();
        for (let i = 0; i < this.newWord.length; i++) {
          if (!validLetters.includes(this.newWord[i])) {
            return;
          }
        }
        this.$emit("start", this.randomWord ? "" : this.newWord);
      }
    },
  },
};
</script>

<style scoped></style>
