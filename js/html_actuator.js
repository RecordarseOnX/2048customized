function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }
  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};



var gameVersion = window.gameVersion || "suisui"; 
// 创建图片缓存
var imageCache = {};

// 图片预加载函数
function preloadImages(version) {
  var imagesToPreload = [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2];
  imagesToPreload.forEach(function (value) {
    var img = new Image();
    img.src = `./images/${version}/${value}.png`; // 根据gameVersion加载图片
    imageCache[`${version}-${value}`] = img; // 将图片缓存到imageCache中
  });
}

// 加载对应版本的图片
preloadImages(gameVersion);

// 使用缓存中的图片
HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);
  var classes   = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");

  // 使用缓存中的图片
  if (tile.value <= 2048) {
    inner.style.backgroundImage = `url('${imageCache[`${gameVersion}-${tile.value}`].src}')`;
  } else {
    inner.style.backgroundImage = `url('${imageCache[`${gameVersion}-2048`].src}')`;
  }

  inner.style.backgroundSize = "cover";
  inner.style.backgroundPosition = "center";

  var numberLabel = document.createElement("div");
  numberLabel.classList.add("tile-number");
  numberLabel.textContent = tile.value;
  
  numberLabel.style.position = "absolute";
  numberLabel.style.bottom = "5px";
  numberLabel.style.right = "5px";
  numberLabel.style.fontSize = "18px";
  numberLabel.style.color = "white";
  numberLabel.style.fontWeight = "bold";
  numberLabel.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  numberLabel.style.borderRadius = "4px";
  numberLabel.style.padding = "3px 5px";
  numberLabel.style.width = "30px";
  numberLabel.style.height = "30px";
  numberLabel.style.display = "flex";
  numberLabel.style.alignItems = "center";
  numberLabel.style.justifyContent = "center";

  inner.appendChild(numberLabel);

  if (tile.previousPosition) {
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes);
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  wrapper.appendChild(inner);
  this.tileContainer.appendChild(wrapper);
};



HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
