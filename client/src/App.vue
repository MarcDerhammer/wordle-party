<template>
  <v-app style="overflow: hidden">
    <top-bar
      :currentRoom="currentRoom"
      :username="username"
      @menu="menu = true"
      :connected="connected"
      :roomCount="roomCount"
      @share="share"
      @help="$refs.mainView.showInfoToast()"
      @people="$refs.mainView.showConnectionInfo()"
      @history="history = true"
      @changeRoom="showJoin = true"
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
        @share="share"
        ref="mainView"
        :roomCount="roomCount"
        :history="history"
        @back="history = false"
      />
    </v-main>
    <v-dialog max-width="400" v-model="menu">
      <v-card>
        <v-card-title
          >Options<v-spacer /><v-icon @click="menu = false"
            >mdi-close</v-icon
          ></v-card-title
        >
        <v-card-text>
          Your display name is <b>{{ username }}</b>
        </v-card-text>
        <v-card-text v-if="currentRoom">
          You are connected to <b>{{ currentRoom }}</b>
        </v-card-text>
        <v-card-text v-else> You are not in a room! </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="changeUsername = true"
            >Set Name
            <v-icon>mdi-account</v-icon>
          </v-btn>
          <v-spacer />
          <v-btn
            :disabled="!currentRoom"
            color="error"
            @click="leave(currentRoom)"
            >Leave Room<v-icon right>mdi-logout</v-icon></v-btn
          >
          <v-spacer />
        </v-card-actions>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="!currentRoom" color="primary" @click="share"
            >Invite Friends<v-icon right>mdi-share</v-icon></v-btn
          >
          <v-spacer />
          <v-btn @click="refresh"
            >reload
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-spacer />
        </v-card-actions>
        <v-card-text style="text-align: center">
          <span>
            <v-icon small>mdi-hamburger</v-icon>
            v {{ version }}
          </span>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog max-width="400" v-model="changeUsername">
      <v-card>
        <v-card-title>Set your Name</v-card-title>
        <v-card-text>
          <v-text-field
            autofocus
            @keyup.enter="setName(tempUsername)"
            label="Display Name"
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
            :autofocus="!existingRooms || !existingRooms.length"
            @keyup.enter="join(roomCode)"
            v-model="roomCode"
            label="Enter Room Code"
            counter="4"
            @input="roomCode = roomCode.toUpperCase()"
          >
          </v-text-field>
          <v-select
            label="Recent rooms"
            autofocus
            v-if="existingRooms && existingRooms.length"
            :items="existingRooms"
            v-model="selectedRoom"
            @change="join(selectedRoom)"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="showJoin = false">Close</v-btn>
          <v-spacer />
          <v-btn
            :disabled="!roomCode || roomCode.length !== 4"
            color="primary"
            @click="join(roomCode)"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog max-width="400" v-model="showNewGame">
      <new-game-options @start="start" @close="showNewGame = false" />
    </v-dialog>
    <v-snackbar top v-model="snackbar">
      {{ text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import NewGameOptions from "./components/NewGameOptions.vue";
import TopBar from "./components/TopBar.vue";
const confetti = require("canvas-confetti");

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
    menu: false,
    fireworksInterval: null,
    snackbar: false,
    text: null,
    connected: false,
    roomCount: null,
    history: false,
    roomList: [],
    selectedRoom: null,
    appBadge: 0
  }),
  computed: {
    version() {
      return this.$store.getters.appVersion;
    },
    dialogOpen() {
      return this.showNewGame || this.showJoin || this.changeUsername;
    },
  },
  created() {
    this.username = localStorage.getItem("name");
    this.existingRooms = JSON.parse(
      localStorage.getItem("existingRooms") || "[]"
    );
    if (!this.username) {
      this.setName("Anon-" + Math.round(this.$randomInRange(0, 99)));
    }
    if (this.$route.params.history) {
      this.history = true;
    }
    setInterval(() => {
      if (this.currentRoom) {
        this.$socket.emit("roomCount", this.currentRoom);
      }
    }, 5000);
    if (navigator.clearAppBadge) {
      window.addEventListener(
        "focus",
        function () {
          this.appBadge = 0;
          navigator.setAppBadge(0);
        },
        false
      );
    }
  },
  methods: {
    share() {
      const url = "https://wordleparty.net/" + this.currentRoom;
      if (!navigator.canShare()) {
        navigator.clipboard.writeText(url);
        this.snackbar = true;
        this.text = "Copied to clipboard!";
        return;
      }
      navigator
        .share({
          title: "Wordle Party",
          text: "Play Wordle with me!",
          url,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        });
    },
    refresh() {
      location.reload();
    },
    getRandomIntInclusive(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    },
    create() {
      this.$socket.emit("create", "somedata");
    },
    join(room) {
      if (this.currentRoom) {
        this.leave(this.currentRoom);
      }
      this.$socket.emit("join", room.toUpperCase());
    },
    start(word, message) {
      console.log("starting with " + word);
      this.$socket.emit("newGame", {
        room: this.currentRoom,
        word,
        message,
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
      this.menu = false;
      localStorage.removeItem("lastRoom");
      if (this.$route.path !== "/") {
        this.$router.push("/");
      }
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
      this.connected = true;
      console.log("connected!!");
      if (this.username) {
        this.setName(this.username);
      }
      if (this.$route.params.id) {
        this.join(this.$route.params.id);
      } else {
        const lastRoom = localStorage.getItem("lastRoom");
        if (lastRoom) {
          this.join(lastRoom);
        }
      }
    },
    disconnect: function () {
      this.connected = false;
    },
    roomCreated: function (room) {
      this.join(room);
    },
    roomJoined: function (room) {
      this.currentRoom = room;
      this.showJoin = false;
      localStorage.setItem("lastRoom", room);
      this.$socket.emit("roomCount", this.currentRoom);
      this.existingRooms = this.existingRooms.filter((x) => x !== room);
      this.existingRooms.unshift(room);
      localStorage.setItem("existingRooms", JSON.stringify(this.existingRooms));
      this.selectedRoom = room;
    },
    roomCount: function (count) {
      this.roomCount = count.toString();
    },
    roomLeft: function (room) {
      this.currentRoom = null;
      console.log("left room " + room);
      localStorage.removeItem("lastRoom");
      clearInterval(this.fireworksInterval);
    },
    roomNotFound: function () {
      this.text = `Room not found!`;
      this.snackbar = true;
    },
    gameState: function (state) {
      // todo.. better
      if (!this.gameState.state && (state.custom || state.message)) {
        this.$refs.mainView.showInfoToast();
      }

      if (this.gameState && this.gameState.state) {
        if (this.gameState.state.length !== state.state.length) {
          if (document.hasFocus() && navigator && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
          if (navigator.setAppBadge) {
            console.log(document.visibilityState, this.appBadge + 1);
            if (document.visibilityState !== 'visible') {
              this.appBadge++;
              navigator.setAppBadge(this.appBadge);
            } else {
              this.appBadge = 0;
              navigator.clearAppBadge();
            }
          }
        }
      }

      this.gameState = state;

      if (this.gameState.won) {
        clearInterval(this.fireworksInterval);
        const defaults = {
          startVelocity: 13,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        };
        const particleCount = 25;
        this.fireworksInterval = setInterval(() => {
          // since particles fall down, start a bit higher than random
          confetti.default(
            Object.assign({}, defaults, {
              particleCount,
              origin: {
                x: this.$randomInRange(0.1, 0.3),
                y: Math.random() - 0.2,
              },
            })
          );
          setTimeout(() => {
            confetti.default(
              Object.assign({}, defaults, {
                particleCount,
                origin: {
                  x: this.$randomInRange(0.7, 0.9),
                  y: Math.random() - 0.2,
                },
              })
            );
          }, this.$randomInRange(0, 500));
        }, 500);
      } else {
        clearInterval(this.fireworksInterval);
      }
    },
  },
};
</script>
