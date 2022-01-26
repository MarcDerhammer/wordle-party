<template>
  <div
    class="baseTile"
    :class="
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
  },
};
</script>

<style scoped>
.baseTile {
  border: solid 2px gray;
  width: 62px;
  height: 62px;
  font-size: 2.5rem;
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