<template>
  <v-app-bar app color="primary" dark>
    <h2 style="line-height: 1.3rem">
      Wordle Party
      <h4
        v-if="currentRoom && $vuetify.breakpoint.xs"
        style="display: block; font-size: 0.9rem"
      >
        Code:
        <code style="font-size: 1.2rem">{{ currentRoom }}</code>
      </h4>
    </h2>
    <v-spacer />
    <h2
      v-if="currentRoom && $vuetify.breakpoint.smAndUp"
      style="display: block"
    >
      Code:
      <code style="font-size: 1.8rem">{{ currentRoom }}</code>
    </h2>
    <v-spacer />
    <h3>{{ username }}</h3>
    <v-icon @click="$emit('changeUsername')" style="margin-left: 5px"
      >mdi-pencil</v-icon
    >
  </v-app-bar>
</template>
<script>
export default {
  name: "TopBar",
  data: () => ({
    
  }),
  props: {
      currentRoom: String,
      username: String
  }
};
</script>

