<template>
  <v-card>
    <v-card-title>New Game Options</v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid">
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
          :rules="wordRules"
        />
        <v-text-field
          v-model="message"
          label="Optional message to be displayed with the word"
          placeholder="Hint, theme, fun greeting, whatever!"
          @keyup.enter="trySubmit"
          :rules="messageRules"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="$emit('close')">Close</v-btn>
      <v-spacer />
      <v-btn @click="trySubmit" :disabled="!valid" color="primary"
        >Start!</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
const regex = new RegExp(/^([a-zA-Z]+)$/);
export default {
  name: "NewGameOptions",
  components: {},
  data: () => ({
    randomWord: true,
    newWord: "",
    showPassword: false,
    message: null,
    wordRules: [
      (v) => !!v || "Word is required",
      (v) => (v && v.length === 5) || "Word must be 5 characters!",
      (v) => (v && regex.test(v)) || "Invalid word!",
    ],
    messageRules: [(v) => (!v || v.length < 160) || "That's too long sorry dude"],
    valid: false,
  }),
  props: {},
  methods: {
    trySubmit() {
      if (!this.valid) {
        return;
      }
      this.newWord = this.newWord.toUpperCase();
      this.$emit("start", this.randomWord ? "" : this.newWord, this.message);
      this.newWord = "";
      this.message = "";
    },
  },
};
</script>

<style scoped></style>
