import Vue from "vue";
import VueRouter from "vue-router";
import Minesweeper from "../pages/Minesweeper/index.vue";
import game2048 from "../pages/2048/index.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "2048",
    component: game2048
  },
  {
    path: "/Minesweeper",
    name: "Minesweeper",
    component: Minesweeper
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
