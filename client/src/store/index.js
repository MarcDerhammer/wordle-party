import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    packageVersion: process.env.VUE_APP_VERSION || '0.0.0',
    colorBlind: false
  },
  mutations: {
    setColorBlind(state, colorBlind) {
      state.colorBlind = colorBlind;
    }
  },
  actions: {},
  modules: {},
  getters: {
    appVersion: (state) => {
      return state.packageVersion;
    },
    colorBlind: (state) => {
      return state.colorBlind
    }
    // the rest of your getters here
  },
});
