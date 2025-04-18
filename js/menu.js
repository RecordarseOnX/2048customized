// 菜单按钮点击事件
document.getElementById('menuButton').addEventListener('click', function() {
  const menu = document.getElementById('menu');
  const soundMenu = document.getElementById('soundMenu');
  if (soundMenu.classList.contains('show')) {
    soundMenu.classList.remove('show');
  } else {
    menu.classList.toggle('show');
  }
});

// 声音设置点击事件
document.getElementById('soundSettings').addEventListener('click', function(event) {
event.preventDefault(); 
const menu = document.getElementById('menu');
const soundMenu = document.getElementById('soundMenu');
menu.classList.remove('show');
soundMenu.classList.add('show');
});

// 关闭菜单事件
document.getElementById('closeMenu').addEventListener('click', function(event) {
  event.preventDefault();
  const soundMenu = document.getElementById('soundMenu');
  soundMenu.classList.remove('show'); // 隐藏声音设置菜单
  soundMenu.classList.add('hidden'); // 添加隐藏类
});


// 控制背景音乐开关
document.getElementById('bgMusicToggle').addEventListener('change', function() {
if (this.checked) {
  musicManager.toggleBackgroundMusic();  // 启用背景音乐
} else {
  musicManager.toggleBackgroundMusic();  // 禁用背景音乐
}
});

// 控制音效开关
document.getElementById('gameSoundToggle').addEventListener('change', function() {
if (this.checked) {
  musicManager.toggleSoundEffects();  // 启用音效
} else {
  musicManager.toggleSoundEffects();  // 禁用音效
}
});
