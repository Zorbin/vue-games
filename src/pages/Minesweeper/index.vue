<template>
  <div class="container">
    <a class="mode" @click.prevent="swithMode('simple')">简单</a>
    <a class="mode" @click.prevent="swithMode('normal')">普通</a>
    <a class="mode" @click.prevent="swithMode('difficult')">困难</a>
    <div class="clearfix board" :class="`${mode}_board`">
      <div
        class="chess"
        :class="{
          [item.type]: item.isCheck,
          isNotCheck: !item.isCheck,
          isTip: item.isTip,
          flag: item.isFlag
        }"
        v-for="(item, idx) in boardData"
        v-bind:key="idx"
        @contextmenu.prevent="insertFlag(item)"
        @mousedown="clickBoard($event, item)"
      >
        {{ item.isCheck ? item.number : "" }}
      </div>
    </div>
    <button @click.prevent="restart">重新开始</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      boardSize: [10, 10], // 棋盘尺寸
      mode: "simple", // 默认模式
      boardData: [], // 棋盘的数据
      minePos: [], // 炸弹的位置
      mineCount: 10, // 炸弹数量
      gameIsOver: false // 记录游戏是否结束
    };
  },
  created() {
    this.initBoard();
  },
  methods: {
    // 选择模式
    swithMode(mode) {
      switch (mode) {
        case "simple":
          this.boardSize = [10, 10];
          this.mineCount = 10;
          this.mode = "simple";
          break;
        case "normal":
          this.boardSize = [15, 15];
          this.mineCount = 35;
          this.mode = "normal";
          break;
        case "difficult":
          this.boardSize = [20, 20];
          this.mineCount = 60;
          this.mode = "difficult";
          break;
      }
      this.initBoard();
    },
    // 初始化棋盘
    initBoard() {
      this.gameIsOver = false;
      const [x, y] = this.boardSize;
      const arr = [];
      for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
          const item = {
            type: "null", //设置初始属性
            isCheck: false, //是否已揭露
            pos: [j, i], //格子的坐标
            isRepeat: false, //是否递归过
            isTip: false, //用户点击数字时的提示
            isFlag: false, //用户是否插了旗子
            number: null
          };
          arr.push(item);
        }
        this.boardData = arr;
      }
      this.createMine();
    },
    // 生成炸弹
    createMine() {
      const {
        mineCount, //雷的数量
        boardData, //棋盘数据
        boardSize: [a, b] //随机最大值
      } = this;
      let i = 0;
      // 随机生成炸弹数组
      const rdArr = [];
      while (i < mineCount) {
        const rd = parseInt(Math.random() * a * b);
        if (rdArr.indexOf(rd) == -1) {
          rdArr.push(rd);
          i++;
        }
      }
      let minePos = [];
      rdArr.map(item => {
        boardData[item].type = "mine";
        minePos.push(boardData[item].pos);
      });
      this.minePos = minePos;
      // 计算炸弹周围数字
      this.calcMineNumber();
    },

    // 生成数字
    calcMineNumber() {
      const { boardData, minePos } = this;
      minePos.map(mine => {
        const neiArr = this.getNeighbor([mine[0], mine[1]]);
        neiArr.map(nei => {
          let idx = this.getIdxByPos(nei);
          if (boardData[idx].type != "mine") {
            boardData[idx].number = boardData[idx].number
              ? boardData[idx].number + 1
              : 1;
            boardData[idx].type = "number";
          }
        });
      });
    },

    // 通过位置获取id
    getIdxByPos([x, y]) {
      const { boardSize } = this;
      return x + y * boardSize[0];
    },

    // 插旗子
    insertFlag(item) {
      // 被点击过的盒子不能插旗子而且数量不能超过雷
      if (item.isFlag || this.getFlagCount < this.mineCount) {
        item.isFlag = !item.isFlag;
      }
      this.isGameOver();
    },

    // 棋盘点击事件
    clickBoard(event, item) {
      if (item.isFlag || gameIsOver) return;
      const { gameIsOver } = this;
      // 游戏结束返回
      if (gameIsOver) return;
      // 不是鼠标左键点击返回
      if (event.button != 0) return;
      item.isCheck = true;
      switch (item.type) {
        // 空置类型
        case "null":
          this.handleSpace(item.pos);
          break;
        // 数字类型
        case "number":
          this.handleNumber(item.pos);
          break;
        // 地雷类型
        case "mine":
          this.handleMine(item);
          break;
      }
      this.isGameOver();
    },

    // 点击了空白
    handleSpace(pos) {
      const { boardData } = this;
      // 获取坐标周围数组
      const NeiArr = this.getNeighbor(pos);
      for (let i = 0; i < NeiArr.length; i++) {
        const idx = parseInt(this.getIdxByPos(NeiArr[i]));
        const item = boardData[idx];
        if (item == undefined) {
          continue;
        }
        // 判断是否已经递归
        if (item.isRepeat == false) {
          item.isRepeat = true;
          // 非地雷类型显示
          if (item.type != "mine") {
            item.isCheck = true;
            item.isFlag = false;
          }
          // 判断数字先跳出
          if (item.type == "number") {
            continue;
          }
          if (item.type == "null") {
            this.handleSpace(item.pos);
          }
        }
      }
    },

    // 点击了数字
    handleNumber(pos) {
      const { boardData } = this;
      const neiArr = this.getNeighbor(pos);
      const tipArr = [];
      for (let i = 0; i < neiArr.length; i++) {
        const idx = this.getIdxByPos(neiArr[i]);
        tipArr.push(idx);
      }
      tipArr.forEach(idx => {
        const item = boardData[idx];
        if (item.isCheck == false && item.isFlag == false) {
          item.isTip = true;
        }
      });
      document.onmouseup = () => {
        tipArr.forEach(idx => {
          const item = boardData[idx];
          item.isTip = false;
        });
        document.onmouseup = null;
      };
    },

    // 点击了地雷
    handleMine(item) {
      item.type = "mine_error";
      this.gameOver();
    },

    // 传入坐标返回坐标的九宫格二维数组
    getNeighbor([x, y]) {
      const [maxX, maxY] = this.boardSize;
      const direct = [
        [x - 1, y - 1], //左上
        [x, y - 1], //中上
        [x + 1, y - 1], //右上
        [x - 1, y], //中左
        [x + 1, y], //中右
        [x - 1, y + 1], //左下
        [x, y + 1], //中下
        [x + 1, y + 1] //右下
      ];
      const filterArr = direct.filter(
        ([posX, posY]) =>
          !(posX < 0 || posY < 0 || posX >= maxX || posY >= maxY)
      );
      return filterArr;
    },

    // 判断游戏结束
    isGameOver() {
      if (this.getRestMineCount == 0 || !this.isNumberUnchecked) {
        this.gameOver();
      }
    },

    // 游戏结束
    gameOver() {
      const { boardData } = this;
      boardData.forEach(item => {
        item.isCheck = true;
        item.isFlag = false;
      });
      this.gameIsOver = true;
    },

    // 重新开始
    restart() {
      this.initBoard();
    }
  },
  computed: {
    // 返回除去正确标中雷后剩余的雷的数量
    getRestMineCount() {
      const { boardData, mineCount } = this;
      let rightFlagCount = 0;
      boardData.forEach(item => {
        if (item.isFlag && item.type == "mine") {
          rightFlagCount++;
        }
      });
      return mineCount - rightFlagCount;
    },
    // 返回插棋子的数量
    getFlagCount() {
      const { boardData } = this;
      let FlagCount = 0;
      boardData.forEach(item => {
        if (item.isFlag) {
          FlagCount++;
        }
      });
      return FlagCount;
    },
    // 判断是否有数字未被揭露
    isNumberUnchecked() {
      const { boardData } = this;
      return boardData.some(item => {
        if (!item.isCheck && item.type != "mine") return true;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/sweeper.scss";
</style>
