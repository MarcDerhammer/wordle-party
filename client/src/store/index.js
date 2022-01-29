import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    packageVersion: '0',
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
