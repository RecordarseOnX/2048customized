function GameManager(size, InputManager, Actuator, StorageManager, musicManager) {
  this.size = size;
  this.inputManager = new InputManager();
  this.storageManager = new StorageManager();
  this.actuator = new Actuator();
  this.musicManager = musicManager; // 将 musicManager 作为属性传递

  this.startTiles     = 2;
  this.undoAvailable  = false; // 是否允许撤回
  this.previousState  = null;  // 保存上一步状态

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
  this.inputManager.on("undo", this.undo.bind(this)); // 监听撤回事件

  this.setup();
}


// 撤回操作
GameManager.prototype.undo = function () {
  if (this.undoAvailable && this.previousState) {
    this.grid = new Grid(this.previousState.grid.size, this.previousState.grid.cells);
    this.score = this.previousState.score;
    this.over = this.previousState.over;
    this.won = this.previousState.won;
    this.keepPlaying = this.previousState.keepPlaying;

    // 恢复状态
    this.actuate();
    this.undoAvailable = false; // 撤回后禁用撤回
  }
};

// 保存游戏状态的快照
GameManager.prototype.saveState = function () {
  // 仅当游戏未结束或玩家没有继续游戏时保存状态
  if (!this.isGameTerminated()) {
    this.previousState = this.serialize();
    this.undoAvailable = true; // 开启撤回功能
  }
};

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

GameManager.prototype.moveTile = function (tile, cell) {
  if (!this.positionsEqual(tile, cell)) { // 只有在位置发生变化时播放音效
    // 将当前 tile 从原位置移除
    this.grid.cells[tile.x][tile.y] = null;
    // 将 tile 放置到新位置
    this.grid.cells[cell.x][cell.y] = tile;
    // 更新 tile 的位置
    tile.updatePosition(cell);

    // 播放滑动音效
    if (musicManager.isSoundEffectsEnabled) {
      musicManager.playSlideEffect();  // 播放滑动音效
    }
  }
};


// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  var self = this;

  if (this.isGameTerminated()) return; // 游戏结束时不做任何事

  var cell, tile;
  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;
  var merged     = false; // 标记是否发生了合并

  // 保存当前状态
  this.saveState();

  // 保存当前tile的位置并清除合并信息
  this.prepareTiles();

  // 遍历并执行移动
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // 仅在能合并时合并
        if (next && next.value === tile.value && !next.mergedFrom) {
          var mergedTile = new Tile(positions.next, tile.value * 2);
          mergedTile.mergedFrom = [tile, next];

          self.grid.insertTile(mergedTile);
          self.grid.removeTile(tile);

          // 合并后的位置信息
          tile.updatePosition(positions.next);

          // 更新分数
          self.score += mergedTile.value;

          // 如果达到2048则玩家获胜
          if (mergedTile.value === 2048) self.won = true;

          // 合并时触发音效
          if (musicManager.isSoundEffectsEnabled) {
            musicManager.playMergeEffect();  // 播放合并音效
          }

          merged = true; // 标记发生了合并
        } else {
          // 只有在位置发生变化时才播放音效
          if (!self.positionsEqual(cell, positions.farthest)) {
            self.moveTile(tile, positions.farthest);
            moved = true;

            // 播放滑动音效
            if (musicManager.isSoundEffectsEnabled) {
              musicManager.playSlideEffect(); // 播放滑动音效
            }
          }
        }
      }
    });
  });

  // 只有在发生了移动或合并时才继续处理
  if (moved || merged) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // 游戏结束
    }

    this.actuate();
  }
};








// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));
  
  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};


GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
