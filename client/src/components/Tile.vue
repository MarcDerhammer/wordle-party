<template>
  <div :class="getClass(status)">
    {{ letter }}
  </div>
</template>

<script>
export default {
  name: "Tile",
  data: () => ({}),
  methods: {
    getClass(status) {
      let cl = "baseTile";
      if (this.mini) {
        cl += "Mini";
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
  },
};
</script>

<style scoped>
.baseTile {
  border: solid 2px gray;
  width: 52px;
  height: 52px;
  font-size: 2.5rem;
  margin: 2px;
  justify-content: center;
  align-items: center;
  display: flex;
  margin-bottom: 28px;
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  font-weight: bold;
}
.baseTileMini {
  border: solid 1px gray;
  width: 15px;
  height: 15px;
  font-size: 0.7rem;
  margin: 1px;
  justify-content: center;
  align-items: center;
  display: flex;
}
.wrong {
  background-color: #3a3a3c;
  border: unset !important;
}
.partial {
  background-color: #b59f3b;
  border: unset !important;
}
.correct {
  background-color: #538d4e;
  border: unset !important;
}
</style>
