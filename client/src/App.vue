<template>
  <v-app style="overflow: hidden">
    <top-bar
      :currentRoom="currentRoom"
      :username="username"
      @changeUsername="changeUsername = true"
    />
    <v-main>
      <router-view
        :currentRoom="currentRoom"
        @create="create"
        @join="showJoin = true"
        @leave="leave"
        @guess="guess"
        :gameState="gameState"
      />
    </v-main>
    <v-dialog max-width="400" v-model="changeUsername">
      <v-card>
        <v-card-title>What should we call you?</v-card-title>
        <v-card-text>
          <v-text-field
            autofocus
            @keyup.enter="setName(tempUsername)"
            v-model="tempUsername"
          >
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="changeUsername = false">Close</v-btn>
          <v-spacer />
          <v-btn
            :disabled="!tempUsername"
            color="primary"
            @click="setName(tempUsername)"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog max-width="400" v-model="showJoin">
      <v-card>
        <v-card-title>Enter room code!</v-card-title>
        <v-card-text>
          <v-text-field
            autofocus
            @keyup.enter="join(roomCode)"
            v-model="roomCode"
            counter="4"
          >
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="showJoin = false">Close</v-btn>
          <v-spacer />
          <v-btn
            :disabled="!roomCode || roomCode.length !== 4"
            color="primary"
            @click="joinRoom(roomCode)"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import TopBar from "./components/TopBar.vue";
export default {
  components: { TopBar },
  name: "App",
  data: () => ({
    username: null,
    changeUsername: false,
    tempUsername: null,
    currentRoom: null,
    roomCode: null,
    showJoin: false,
    gameState: [],
  }),
  created() {
    this.username = localStorage.getItem("name");
    if (!this.username) {
      this.setName("Anon-" + this.getRandomIntInclusive(0, 50));
    }
    const lastRoom = localStorage.getItem("lastRoom");
    if (lastRoom) {
      this.join(lastRoom);
    }
  },
  methods: {
    getRandomIntInclusive(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    },
    create() {
      this.$socket.emit("create", "somedata");
    },
    join(room) {
      console.log("tryin to join");
      this.$socket.emit("join", room);
    },
    setName(name) {
      this.username = name;
      localStorage.setItem("name", name);
      this.$socket.emit("setName", name);
      this.changeUsername = false;
    },
    leave(room) {
      console.log("Trying to leave " + room);
      this.$socket.emit("leave", room);
    },
    guess(word) {
      const payload = {
        room: this.currentRoom,
        word,
      };
      this.$socket.emit("guess", payload);
    },
  },
  sockets: {
    connect: function () {
      console.log("connected!!");
      if (this.username) {
        this.setName(this.username);
      }
    },
    roomCreated: function (room) {
      this.join(room);
    },
    roomJoined: function (room) {
      this.currentRoom = room;
      this.showJoin = false;
      localStorage.setItem("lastRoom", room);
    },
    roomLeft: function (room) {
      this.currentRoom = null;
      console.log("left room " + room);
      localStorage.setItem("lastRoom", null);
    },
    gameState: function (state) {
      this.gameState = state;
      console.log(this.gameState);
    },
  },
};
</script>
