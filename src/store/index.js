import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    bestScore: 0
  },
  mutations: {
    setBestScore(state, newScore) {
      state.bestScore = newScore;
    }
  },
  actions: {},
  modules: {}
});
