import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueSocketIO from "vue-socket.io";
import SocketIO from "socket.io-client";

import "./registerServiceWorker";

const BASE_API = process.env.NODE_ENV === "development" ?
  "http://localhost:32392" :
  "https://wordle.marcapi.com";

const socketConnection = SocketIO(BASE_API);

Vue.config.productionTip = false;

Vue.prototype.$randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

Vue.prototype.$baseApi = BASE_API;

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: socketConnection,
    vuex: {
      store,
      actionPrefix: "SOCKET_",
      mutationPrefix: "SOCKET_",
    },
  })
);

new Vue({
  router,
  store,
  vuetify,
  render: function (h) {
    return h(App);
  },
}).$mount("#app");
