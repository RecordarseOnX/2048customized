function MusicManager() {
    this.backgroundMusic = new Audio("music/background-music.mp3");
    this.slideEffect = new Audio("music/sound_effects.mp3"); // 滑动音效
    this.mergeEffect = new Audio("music/get_effects.mp3"); // 合成音效
  
    this.backgroundMusic.loop = true; // 背景音乐循环
    this.isMusicEnabled = false; // 默认关闭背景音乐
    this.isSoundEffectsEnabled = false; // 默认关闭音效
  
    // 监听页面可见性变化
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
  }
  
  // 播放背景音乐
  MusicManager.prototype.playBackgroundMusic = function () {
    if (this.isMusicEnabled) {
      this.backgroundMusic.play();
    }
  };
  
  // 暂停背景音乐
  MusicManager.prototype.pauseBackgroundMusic = function () {
    this.backgroundMusic.pause();
  };
  
  // 播放滑动音效
  MusicManager.prototype.playSlideEffect = function () {
    if (this.isSoundEffectsEnabled) {
      this.slideEffect.currentTime = 0; // 重置播放时间
      this.slideEffect.play();
    }
  };
  
  // 播放合成音效
  MusicManager.prototype.playMergeEffect = function () {
    if (this.isSoundEffectsEnabled) {
      this.mergeEffect.currentTime = 0; // 重置播放时间
      this.mergeEffect.play();
    }
  };
  
  // 切换背景音乐状态
  MusicManager.prototype.toggleBackgroundMusic = function () {
    this.isMusicEnabled = !this.isMusicEnabled;
    if (this.isMusicEnabled) {
      this.playBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
  };
  
  // 切换音效状态
  MusicManager.prototype.toggleSoundEffects = function () {
    this.isSoundEffectsEnabled = !this.isSoundEffectsEnabled;
  };
  
  // 处理页面可见性变化
  MusicManager.prototype.handleVisibilityChange = function () {
    if (document.hidden) {
      // 页面不可见，暂停背景音乐
      if (this.isMusicEnabled) {
        this.backgroundMusic.pause();
      }
    } else {
      // 页面可见，恢复背景音乐
      if (this.isMusicEnabled) {
        this.backgroundMusic.play();
      }
    }
  };
  
  // 创建一个全局实例
  const musicManager = new MusicManager(); // 全局实例化 musicManager
  