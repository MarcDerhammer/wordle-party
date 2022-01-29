<template>
  <div
    ref="tile"
    :style="`height: ${width}px`"
    :class="large ? 'baseTileLarge' : getClass(status)"
  >
    {{ letter }}
  </div>
</template>

<script>
const keyboardHeight = 180;
const headerHeight = 100;

export default {
  name: "Tile",
  data: () => ({
    width: '32'
  }),
  mounted() {
    this.$nextTick(() => {
      this.width = this.$refs.tile.clientWidth;
    });
  },
  computed: {
    width() {
      return this.$refs.tile;
    },
    size() {
      const availableHeight =
        this.screen.height - (keyboardHeight + headerHeight);
      const availableWidth = this.screen.width;
      const min = Math.min(availableHeight, availableWidth);
      return min / 6;
    },
    fontSize() {
      return this.size * 0.7 + "px";
    },
  },
  methods: {
    getClass(status) {
      let cl = "baseTile";
      if (this.mini) {
        cl += "Mini";
      }
      if (this.letter) {
        cl += " filled ";
      }
      cl += " ";
      switch (status) {
        case "correct":
          cl += "correct";
          break;
        case "partial":
          cl += "partial";
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
    large: Boolean
  },
};
</script>

<style scoped>
.baseTile {
  border: solid 2px rgb(95, 95, 95);
  margin: 2px;
  justify-content: center;
  align-items: center;
  display: flex;
  font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
  font-weight: bold;
  opacity: 0.3;
  flex: 1 1 10px;
  }
.baseTileMini {
  width: 15px !important;
  border: solid 2px rgba(95, 95, 95, 0.3);
  height: 15px !important;
  font-size: 0.7rem;
  margin: 1px;
  justify-content: center;
  align-items: center;
  display: flex;
}
.baseTileLarge {
  width: 28px !important;
  border: solid 2px rgba(95, 95, 95, 0.3);
  height: 28px !important;
  font-size: 23px;
  margin: 1px;
  justify-content: center;
  align-items: center;
  display: flex;
}
.filled {
  border: solid 2px rgba(95, 95, 95, 0.9) !important;
  transition: all 0.2s ease-in-out;
  opacity: 1;
}
.wrong {
  background-color: #3a3a3c;
  border: unset !important;
  animation: shake 0.3s;
}
.partial {
  background-color: #b59f3b;
  border: unset !important;
  animation: yellowShadow 0.5s;
}
.correct {
  background-color: #538d4e;
  border: unset !important;
  animation: greenShadow 0.5s;
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
    box-shadow: 0 0 0 8px #538d4e;
  }
}
@keyframes yellowShadow {
  0% {
    box-shadow: 0 0 0 4px #b59f3b;
  }
}
</style>
