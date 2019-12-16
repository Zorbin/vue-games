<template>
  <div class="app_container">
    <score-view ref="scoreView" :target="target"></score-view>
    <div class="control_contianer">
      <div class="size_control">
        <span>Size:</span>
        <div class="size_selection" @click="selectBoardSize(size.size)" v-for="(size, index) in sizeSelection" :key="index">
          <span>{{ size.size }}</span>
        </div>
      </div>
      <div class="game_switch" @click="gameSwitchHandler">{{ gameIsOver ? "新游戏" : "结束游戏" }}</div>
    </div>
    <div :class="`game_container boardsize${boardSize}`">
      <div class="grid_contain">
        <div class="grid_row clearfix" v-for="(row, i) in boardData" :key="i">
          <div class="grid_cell" v-for="(row, j) in row" :key="j"></div>
        </div>
      </div>
      <div class="num_contain">
        <div
          class="num_cell"
          :class="getClass(cell)"
          v-for="cell in getCells"
          :key="cell.id"
        >
          <span>{{ cell.value }}</span>
        </div>
      </div>
      <overlay v-show="isloss || win"></overlay>
    </div>
  </div>
</template>

<script>
import overlay from "./overlay.vue";
import score from "./score.vue";
export default {
  data() {
    return {
      boardData: [], // 方格矩阵
      boardSize: 4, // 默认棋盘大小
      gameIsOver: false, // 游戏结束标志
      cells: [], // 方格上的数据
      idCounter: 0, // 方格id计数器
      win: false, // 获胜标志
      target: 0, // 目标数字
      curScore: 0, // 当前分数
      mergeScore: 0, //合并获得分数
      highScore: 0, // 最高分数
      sizeSelection: {} // 方格尺寸数据
    };
  },
  mounted() {
    window.addEventListener("keydown", this.keyDownHandler);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },
  created() {
    this.initSizeSelection();
    this.initBoard();
  },
  methods: {
    // 初始化棋盘
    initBoard() {
      const { boardSize } = this;
      this.target = this.sizeSelection[this.boardSize].target;
      this.boardData = [];
      this.cells = [];
      for (let i = 0; i < boardSize; i++) {
        this.boardData.push([]);
        for (let j = 0; j < boardSize; j++) {
          this.boardData[i][j] = this.createCell();
        }
      }
      this.createRandCell();
      this.setPosition();
      this.win = false;
      this.gameIsOver = false;
    },
    // 初始化尺寸选择项
    initSizeSelection() {
      const { sizeSelection } = this;
      class size {
        constructor(size, timesForRand, numberOfRand, target) {
          this.size = size;
          this.timesForRand = timesForRand; // 初始化生成随机格子的次数
          this.numberOfRand = numberOfRand; // 每次生成随机格子的个数
          this.target = target; // 目标格子数字
        }
      }
      const size3 = new size(3, 1, 2, 256);
      const size4 = new size(4, 1, 2, 2048);
      const size5 = new size(5, 2, 2, 4096);
      const size6 = new size(6, 2, 3, 8192);
      sizeSelection[3] = size3;
      sizeSelection[4] = size4;
      sizeSelection[5] = size5;
      sizeSelection[6] = size6;
    },
    // 选择棋盘尺寸
    selectBoardSize(size){
      this.boardSize = size;
      this.initBoard();
    },
    // 生成格子
    createCell(value, pos) {
      const cell = {
        pos: pos || [-1, -1],
        oldPos: [-1, -1],
        value: value || 0,
        mergeto: null,
        delete: false,
        id: this.idCounter++
      };
      this.cells.push(cell);
      return cell;
    },
    // 生成随机格子
    createRandCell() {
      const { boardData, boardSize } = this;
      // 找出空位置
      let emptyCells = [];
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (boardData[i][j].value == 0) {
            emptyCells.push({ r: i, c: j });
          }
        }
      }
      let numOfEmptyCells = emptyCells.length;
      // 不同难度对应生成随机格子数
      let count = this.sizeSelection[this.boardSize].numberOfRand;
      while (numOfEmptyCells > 0 && count > 0) {
        // 生成随机格子
        const rd = parseInt(Math.random() * numOfEmptyCells);
        const cell = emptyCells.splice(rd, 1)[0];
        // 随机生成2或4 机率比例为0.9
        var newValue = Math.random() < 0.9 ? 2 : 4;
        this.boardData[cell.r][cell.c] = this.createCell(newValue);
        numOfEmptyCells -= 1;
        count -= 1;
      }
    },
    // 移动方格 0左移 1上移 2右移 3下移
    move(direction) {
      this.clearMergedCell();
      for (let i = 0; i < direction; i++) {
        this.boardData = this.rotateLeft(this.boardData);
      }
      const hasChanged = this.moveLeft();
      for (let i = direction; i < 4; i++) {
        this.boardData = this.rotateLeft(this.boardData);
      }
      if (hasChanged) {
        for (let i = 0; i < this.sizeSelection[this.boardSize].timesForRand; i++) {
          this.createRandCell();
        }
      }
      this.setPosition();
    },
    // 左移方格
    moveLeft() {
      var hasChanged = false;
      const { boardSize } = this;
      let mergeScore = 0;
      // 将所有元素移到左边
      for (let i = 0; i < boardSize; i++) {
        let curRow = this.boardData[i].filter(cell => cell.value != 0);
        let resultRow = [];
        for (let j = 0; j < boardSize; j++) {
          let targetCell = curRow.length ? curRow.shift() : this.createCell();
          // 可以合并
          if (curRow.length > 0 && curRow[0].value == targetCell.value) {
            var cell1 = targetCell;
            targetCell = this.createCell(targetCell.value);
            cell1.mergeto = targetCell;
            var cell2 = curRow.shift();
            cell2.mergeto = targetCell;
            targetCell.value += cell2.value;
            mergeScore += targetCell.value;
          }
          resultRow[j] = targetCell;
          this.win |= targetCell.value == this.target;
          hasChanged |= targetCell.value != this.boardData[i][j].value;
        }
        this.boardData[i] = resultRow;
      }
      // 合并分数大于0
      if (mergeScore) this.$refs.scoreView.addScore(mergeScore);
      return hasChanged;
    },
    // 重新设置位置
    setPosition() {
      for (let i = 0; i < this.boardData.length; i++) {
        for (let j = 0; j < this.boardData[i].length; j++) {
          const item = this.boardData[i][j];
          item.oldPos = item.pos;
          item.pos = [i, j];
          item.delete = false;
        }
      }
    },
    // 清除合并后的方格
    clearMergedCell() {
      this.cells = this.cells.filter(cell => !cell.delete);
      for (let i = 0; i < this.cells.length; i++) {
        this.cells[i].delete = true;
      }
    },
    // 矩阵逆时针旋转
    rotateLeft(matrix) {
      var res = [];
      for (let i = 0; i < matrix.length; i++) {
        res.push([]);
        for (let j = 0; j < matrix[i].length; j++) {
          res[i][j] = matrix[j][matrix[i].length - i - 1];
        }
      }
      return res;
    },
    // 键盘按键处理器
    keyDownHandler(event) {
      if (this.win || this.isloss) {
        return;
      }
      if (event.keyCode >= 37 && event.keyCode <= 40) {
        event.preventDefault();
        const direction = event.keyCode - 37;
        this.move(direction);
      }
    },
    // 结束游戏
    endThisGame() {
      this.gameIsOver = true;
    },
    // 游戏开关的处理器
    gameSwitchHandler() {
      if (this.gameIsOver) {
        this.initBoard();
      } else {
        this.endThisGame();
      }
    },
  },
  computed: {
    // 筛选有数据的节点
    getCells() {
      return this.cells.filter(cell => cell.value > 0);
    },
    // 动态获取格子样式
    getClass() {
      return function(cell) {
        const classArray = [];
        classArray.push("cell-" + cell.value);
        if (!cell.mergeto) {
          classArray.push("pos" + cell.pos[0] + "-" + cell.pos[1]);
        } else {
          classArray.push("merge");
        }
        if (cell.oldPos[0] == -1 && !cell.mergeto) {
          classArray.push("new");
        }
        const fromRow = cell.mergeto ? cell.pos[0] : cell.oldPos[0];
        const fromCol = cell.mergeto ? cell.pos[1] : cell.oldPos[1];
        const toRow = cell.mergeto ? cell.mergeto.pos[0] : cell.pos[0];
        const toCol = cell.mergeto ? cell.mergeto.pos[1] : cell.pos[1];
        if (
          cell.mergeto ||
          (fromRow != -1 && (fromRow != toRow || fromCol != toCol))
        ) {
          classArray.push("row_" + fromRow + "_to_" + toRow);
          classArray.push("col_" + fromCol + "_to_" + toCol);
          classArray.push("moving");
        }
        return classArray;
      };
    },
    // 失败判定
    isloss() {
      if (this.gameIsOver) return true;
      const { boardData, boardSize } = this;
      const direction = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ];
      for (let i = 0; i < boardData.length; i++) {
        for (let j = 0; j < boardData[i].length; j++) {
          const cell = boardData[i][j];
          // 格子未满
          if (cell.value == 0) return false;
        }
      }
      for (let i = 0; i < boardData.length; i++) {
        for (let j = 0; j < boardData[i].length; j++) {
          const cell = boardData[i][j];
          for (let d = 0; d < direction.length; d++) {
            const [x, y] = [
              cell.pos[0] + direction[d][0],
              cell.pos[1] + direction[d][1]
            ];
            if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
              if (cell.value == boardData[x][y].value) {
                return false;
              }
            }
          }
        }
      }
      return true;
    }
  },
  components: {
    overlay,
    "score-view": score
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/2048.scss";
</style>
