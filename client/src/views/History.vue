<template>
  <div style="max-width: 800px; margin: auto; margin-top: 30px">
    <h2>{{ room }} Game History</h2>
    <v-btn
      style="position: fixed; top: 48px; left: 10px; z-index: 99999"
      small
      color="primary"
      @click="$emit('back')"
    >
      <v-icon>mdi-arrow-left</v-icon>Back</v-btn
    >
    <div v-if="loading">
      <v-progress-circular indeterminate />
    </div>
    <div v-else>
      <div v-if="games && games.length === 0">No history yet....... go play!</div>

      <div v-for="(game, index) in games" v-bind:key="index">
        <v-card
          style="
            margin: 20px;
            padding: 30px;
            padding-top: 0px;
            white-space: normal;
          "
        >
          <v-card-title v-if="game.custom">
            <v-spacer />
            Custom Word chosen by&nbsp;
            <b>{{ game.username || "Unknown" }}</b>
            <v-spacer />
          </v-card-title>
          <v-card-title v-else
            ><v-spacer />Random Word<v-spacer
          /></v-card-title>
          <v-card-text style="margin: 0px; padding: 0px" v-if="game.message">
            {{ game.username || "Unknown" }} says "{{ game.message }}"
          </v-card-text>
          <v-card-text>
            <v-row no-gutters>
              <v-col style="font-size: 0.8rem" cols="12">
                Started: {{ new Date(game.startTime).toLocaleString() }} </v-col
              ><v-col style="font-size: 0.8rem" cols="12"
                >Ended:
                {{
                  new Date(
                    game.endTime || game.state[game.state.length - 1].timestamp
                  ).toLocaleString()
                }}
              </v-col>
            </v-row>
          </v-card-text>
          <v-spacer />
          <Game history :screen="screen" :rows="game.state" />
          <div v-if="game.answerWas && game.lost">
            The word was <b>{{ game.answerWas }}</b>
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import Game from "../components/Game.vue";
export default {
  name: "History",
  components: {
    Game,
  },
  computed: {
    availableWidth() {
      return Math.min(this.screen.width, 500);
    },
    availableHeight() {
      return this.screen.height - (48 + 189);
    },
  },
  methods: {},
  data: () => ({
    now: new Date().getTime(),
    height: window.innerHeight,
    width: window.innerWidth,
    timeInterval: null,
    games: null,
    loading: false,
  }),
  props: {
    screen: Object,
    room: String,
  },
  created() {
    this.loading = true;
    fetch(`${this.$baseApi}/history?room=${this.room}`)
      .then((response) => response.json())
      .then((data) => {
        data.forEach((d) => {
          const endTime = d.state[d.state.length - 1].timestamp;
          for (let i = d.state.length; i < 6; i++) {
            let tiles = [];
            for (let j = 0; j < 5; j++) {
              tiles.push({
                letter: "",
                status: "correct",
              });
            }
            d.state.push({
              tiles: tiles,
              author: "...",
              timestamp: endTime,
            });
          }
        });
        this.games = data.sort((a, b) => {
          return b.startTime - a.startTime;
        });
        this.loading = false;
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
        this.games = [];
      });
    this.timeInterval = setInterval(() => {
      this.now = new Date().getTime();
    }, 1000);
    window.addEventListener("resize", () => {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
    });
  },
  destroyed() {
    clearInterval(this.timeInterval);
  },
  sockets: {},
};
</script>
