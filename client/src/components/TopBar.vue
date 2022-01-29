<template>
  <v-app-bar style="height: 42px" dense app color="primary" dark>
    <h3 style="line-height: 1.3rem">
      Wordle Party
      <h4
        v-if="currentRoom && $vuetify.breakpoint.xs"
        style="display: block; font-size: 0.7rem"
      >
        Code:
        <code style="font-size: 0.8rem">{{ currentRoom }}</code>
      </h4>
    </h3>
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
    <v-icon @click="$emit('menu')" style="margin-left: 5px">mdi-menu</v-icon>
  </v-app-bar>
</template>
<script>
export default {
  name: "TopBar",
  data: () => ({}),
  props: {
    currentRoom: String,
    username: String,
  },
};
</script>
