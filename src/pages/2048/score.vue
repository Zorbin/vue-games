<template>
  <div class="score_container">
    <div class="target">{{ target }}</div>
    <div class="myscore">
      <div class="cur_score">
        <span class="label">Score</span>
        <span class="value">{{ curScore }}</span>
        <span class="add_score" v-show="adding">+{{ mergeScore }}</span>
      </div>
      <div class="best_score">
        <span class="label">Best</span>
        <span class="value">{{ getBestScore }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["target"],
  data() {
    return {
      curScore: 0, // 当前成绩
      adding: false, // 成绩增加动画标志
      mergeScore: 0 // 合并获得的分数
    };
  },
  computed: {
    getBestScore() {
      return this.$store.state.bestScore;
    }
  },
  methods: {
    // 分数增加
    addScore(mergeScore) {
      this.numScroll(this.curScore, mergeScore);
      this.adding = true;
      this.mergeScore = mergeScore;

      setTimeout(() => {
        this.adding = false;
      }, 500);
    },
    // 数字滚动效果
    numScroll(startNum, addNum) {
      let numText = startNum;
      let addText = addNum;
      const step = 2;
      let glob;
      const numSlide = () => {
        if (addText > step) {
          numText += step;
          glob = requestAnimationFrame(numSlide);
        } else {
          numText += addText;
          cancelAnimationFrame(glob);
        }
        addText -= step;
        this.curScore = numText;
        if (this.curScore > this.getBestScore) {
          this.$store.commit("setBestScore", this.curScore);
        }
      };
      numSlide();
    }
  }
};
</script>

<style lang="scss" scpoed>
.score_container {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;

  .target {
    font-size: 50px;
    font-weight: bold;
    padding: 10px;
    color: #fff;
    border-radius: 10px;
    background-color: #ff6f3c;
    box-shadow: #d45839 0 7px 10px;
  }

  .myscore {
    display: flex;
    align-items: center;

    div {
      padding: 5px 30px;
      background-color: #98b7d7;
      margin-left: 20px;
      border-radius: 10px;
      font-weight: bold;
      color: #fff;
      position: relative;

      span.label {
        font-size: 20px;
        display: block;
      }

      span.value {
        font-size: 30px;
      }

      .add_score {
        color: #666;
        animation-duration: 0.5s;
        transition-timing-function: ease;
        animation-name: addScore;
        animation-fill-mode: forwards;
        position: absolute;
        top: 40px;

        @keyframes addScore {
          from {
            transform: translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(0, -20px);
            opacity: 0;
          }
        }
      }
    }
  }
}
</style>
