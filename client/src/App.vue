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
        @newGame="newGame"
        :gameState="gameState"
        :dialogOpen="dialogOpen"
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
            :disabled="!tempUsername || tempUsername.length > 8"
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
    <v-dialog max-width="400" v-model="showNewGame">
      <new-game-options @start="start" @close="showNewGame = false" />
    </v-dialog>
  </v-app>
</template>

<script>
import NewGameOptions from "./components/NewGameOptions.vue";
import TopBar from "./components/TopBar.vue";
export default {
  components: { TopBar, NewGameOptions },
  name: "App",
  data: () => ({
    username: null,
    changeUsername: false,
    tempUsername: null,
    currentRoom: null,
    roomCode: null,
    showJoin: false,
    gameState: {},
    showNewGame: false,
  }),
  computed: {
    dialogOpen() {
      return this.showNewGame || this.showJoin || this.changeUsername;
    },
  },
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
      this.$socket.emit("join", room);
    },
    start(word) {
      console.log("starting with " + word);
      this.$socket.emit("newGame", {
        room: this.currentRoom,
        word,
      });
      this.showNewGame = false;
    },
    setName(name) {
      if (!name || name.length > 8) {
        return;
      }
      this.username = name.substring(0, 8);
      localStorage.setItem("name", this.username);
      this.$socket.emit("setName", this.username);
      this.changeUsername = false;
    },
    leave(room) {
      this.$socket.emit("leave", room);
    },
    newGame() {
      this.showNewGame = true;
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
      if (this.$route.params.id) {
        this.join(this.$route.params.id);
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
    },
  },
};
</script>
