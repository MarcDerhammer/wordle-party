<template>
  <div
    :style="`font-size: ${size}px`"
    ref="tile"
    class="baseTile"
    :class="getClass(status)"
  >
    {{ letter || "&nbsp;" }}
  </div>
</template>

<script>
const confetti = require("canvas-confetti");

export default {
  name: "Tile",
  data: () => ({
    size: 33,
  }),
  mounted() {
    this.$nextTick(() => {
      if (this.mini) {
        this.size = 15;
        return;
      }
      const min = Math.min(this.screen.width, this.screen.height - (48 + 189));
      this.size = min / 12;
    });
  },
  methods: {
    fireConfetti() {
      const height = window.innerHeight;
      const width = window.innerWidth;
      const tileX = this.$refs.tile.getBoundingClientRect().x + this.size;
      const tileY = this.$refs.tile.getBoundingClientRect().y + this.size;
      confetti.default({
        angle: this.$randomInRange(80, 110),
        spread: this.$randomInRange(30, 50),
        startVelocity: this.$randomInRange(15, 30),
        particleCount: this.$randomInRange(30, 50),
        origin: {
          x: tileX / width,
          y: tileY / height,
        },
        gravity: 1,
      });
    },
    getClass(status) {
      let cl = "baseTile";
      if (this.mini) {
        cl += "Mini";
        return cl;
      }
      if (this.letter) {
        cl += " filled ";
      }
      cl += " ";
      switch (status) {
        case "correct":
          cl += `correct${this.colorBlind ? "CB" : ""}`;
          break;
        case "partial":
          cl += `partial${this.colorBlind ? "CB" : ""}`;
          break;
        case "wrong":
          cl += "wrong";
          break;
        default:
          break;
      }
      return cl;
    },
  },
  props: {
    letter: String,
    status: String,
    mini: {
      type: Boolean,
      default: false,
    },
    screen: Object,
    large: Boolean,
    history: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    colorBlind() {
      return this.$store.getters.colorBlind;
    },
  },
  watch: {
    status() {
      if (this.status === "correct" && !this.history) {
        this.fireConfetti();
      }
    },
    // prettier-ignore
    screen: function(val) {
      if (this.mini) {
        return;
      }
      const min = Math.min(val.width, val.height - (48 + 189));
      this.size = min / 12;
    },
  },
};
</script>

<style scoped>
.baseTile {
  border: solid 2px rgb(95, 95, 95);
  justify-content: center;
  align-items: center;
  display: flex;
  font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
  font-weight: bold;
  opacity: 0.3;
  height: 100%;
  width: 100%;
  font-size: 2.5rem;
  overflow: hidden;
}
.baseTileMini {
  width: 25px !important;
  height: 25px !important;
  margin: 1px;
  justify-content: center;
  font-size: 15px;
  opacity: 1;
  align-items: center;
  display: flex;
  border: solid 2px rgba(95, 95, 95, 0.9) !important;
}
.filled {
  border: solid 2px rgba(95, 95, 95, 0.9) !important;
  transition: all 0.2s ease-in-out;
  opacity: 1;
}
.wrong {
  background-color: var(--wrong);
  border: unset !important;
  animation: shake 0.3s;
}
.partial {
  background-color: var(--partial);
  border: unset !important;
  animation: yellowShadow 0.7s;
  z-index: 998;
}
.partialCB {
  background-color: var(--partialCB);
  border: unset !important;
  animation: yellowShadowCB 0.7s;
  z-index: 998;
}
.correct {
  background-color: var(--correct);
  border: unset !important;
  animation: greenShadow 0.8s;
  z-index: 999;
}
.correctCB {
  background-color: var(--correctCB);
  border: unset !important;
  animation: greenShadowCB 0.8s;
  z-index: 999;
}
@keyframes shake {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}
@keyframes greenShadow {
  0% {
    box-shadow: 0 0 0 18px var(--correct);
  }
}
@keyframes yellowShadow {
  0% {
    box-shadow: 0 0 0 12px var(--partial);
  }
}
@keyframes greenShadowCB {
  0% {
    box-shadow: 0 0 0 18px var(--correctCB);
  }
}
@keyframes yellowShadowCB {
  0% {
    box-shadow: 0 0 0 12px var(--partialCB);
  }
}
</style>
