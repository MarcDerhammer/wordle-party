import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    packageVersion: process.env.PACKAGE_VERSION || "0",
  },
  mutations: {},
  actions: {},
  modules: {},
  getters: {
    appVersion: (state) => {
      return state.packageVersion;
    }
  },
});
