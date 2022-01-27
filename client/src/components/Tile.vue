<template>
  <div
    class="baseTile"
    :class="
      mini ? 'baseTileMini ' : 'baseTile ' + 
      status === 'correct'
        ? 'correct'
        : status === 'wrong'
        ? 'wrong'
        : status === 'partial'
        ? 'partial'
        : ''
    "
  >
    {{ letter }}
  </div>
</template>

<script>
export default {
  name: "Tile",
  data: () => ({}),
  props: {
    letter: String,
    status: String,
    mini: {
      type: Boolean,
      default: false
    }
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
  background-color: rgb(75, 75, 75);
}
.partial {
  background-color: rgb(134, 113, 45);
}
.correct {
  background-color: rgb(34, 87, 23);
}
</style>
