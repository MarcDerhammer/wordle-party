<template>
  <v-app-bar style="height: 42px" dense app color="primary" dark>
    <h3 style="line-height: 1rem">
      Wordle Party
      <h4
        v-if="currentRoom && $vuetify.breakpoint.xs"
        style="display: block; font-size: 0.7rem"
      >
        Room:
        <code @click="$emit('changeRoom')" style="font-size: 0.8rem">{{
          currentRoom
        }}</code>
        <v-icon color="red" x-small v-if="!connected"
          >mdi-cloud-off-outline</v-icon
        >
        <v-badge
          @click="$emit('people')"
          inline
          v-else
          color="#538d4e"
          :content="roomList.length"
        >
          <v-icon @click="$emit('people')" small>mdi-account-group</v-icon>
        </v-badge>
        <v-icon @click="$emit('help')" class="babyButton"
          >mdi-help-circle-outline</v-icon
        >
        <v-icon @click="$emit('share')" class="babyButton"
          >mdi-share-variant</v-icon
        >
        <v-icon @click="$emit('history')" class="babyButton"
          >mdi-history</v-icon
        >
      </h4>
    </h3>
    <v-spacer />
    <h2
      v-if="currentRoom && $vuetify.breakpoint.smAndUp"
      style="display: block"
    >
      Room:
      <code @click="$emit('changeRoom')" style="font-size: 1.8rem">{{
        currentRoom
      }}</code>
      <v-icon style="margin-left: 13px" color="red" large v-if="!connected"
        >mdi-cloud-off-outline</v-icon
      >
      <v-badge overlap v-else color="#538d4e" :content="roomList.length">
        <v-icon @click="$emit('people')" large>mdi-account-group</v-icon>
      </v-badge>
      <v-icon @click="$emit('help')" large style="margin-left: 13px"
        >mdi-help-circle-outline</v-icon
      >
      <v-icon @click="$emit('share')" large style="margin-left: 13px"
        >mdi-share-variant</v-icon
      >
      <v-icon @click="$emit('history')" large style="margin-left: 13px"
        >mdi-history</v-icon
      >
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
    roomList: Array,
  },
};
</script>

<style scoped>
.babyButton {
  margin-left: 6px;
  transform: translate(0px, -3px);
}
</style>