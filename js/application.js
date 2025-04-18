window.requestAnimationFrame(function () {
  // 初始化 GameManager 和 MusicManager
  var musicManager = new MusicManager(); // 先初始化 musicManager
  var gameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager, musicManager);  // 传入 musicManager
  // 获取撤回按钮
  var undoButton = document.getElementById('undoButton');

  // 为撤回按钮添加点击事件监听器
  undoButton.addEventListener('click', function () {
    // 当点击撤回按钮时，触发 'undo' 事件
    gameManager.inputManager.emit('undo');
  });

  // 获取声音设置菜单和按钮
  var soundMenu = document.getElementById("soundMenu");
  var soundSettingsButton = document.getElementById("soundSettings");
  var backToMenuButton = document.getElementById("backToMenu");
  var gameSoundToggle = document.getElementById("gameSoundToggle");
  var bgMusicToggle = document.getElementById("bgMusicToggle");

  // 显示声音设置菜单
  soundSettingsButton.addEventListener("click", function () {
    soundMenu.classList.remove("hidden");
  });

  // 游戏音效切换
  gameSoundToggle.addEventListener("change", function () {
    musicManager.toggleSoundEffects();
  });

  // 背景音乐切换
  bgMusicToggle.addEventListener("change", function () {
    musicManager.toggleBackgroundMusic();
  });
});
