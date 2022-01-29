import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    packageVersion: process.env.VUE_APP_VERSION || '0.0.0',
  },
  mutations: {},
  actions: {},
  modules: {},
  getters: {
    appVersion: (state) => {
      return state.packageVersion;
    },
    // the rest of your getters here
  },
});
