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
        <v-icon color="red" x-small v-if="!connected"
          >mdi-cloud-off-outline</v-icon
        >

        <v-badge inline v-else color="#538d4e" :content="roomCount">
          <v-icon small>mdi-account-group</v-icon>
        </v-badge>
      </h4>
    </h3>
    <v-spacer />
    <h2
      v-if="currentRoom && $vuetify.breakpoint.smAndUp"
      style="display: block"
    >
      Code:
      <code style="font-size: 1.8rem">{{ currentRoom }}</code>
      <v-icon color="red" large v-if="!connected"
          >mdi-cloud-off-outline</v-icon
        >

        <v-badge overlap v-else color="#538d4e" :content="roomCount">
          <v-icon large>mdi-account-group</v-icon>
        </v-badge>
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
    connected: Boolean,
    roomCount: String
  },
};
</script>
