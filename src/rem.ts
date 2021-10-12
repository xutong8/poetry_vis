// 1rem大小
const baseSize = 16;

function setRem() {
  // 实际设备页面宽度和设计稿的比值
  const scale = document.documentElement.clientWidth / 1920;
  // 计算实际的rem值并赋予给html的font-size
  document.documentElement.style.fontSize = baseSize * scale + 'px';
}

setRem();

window.addEventListener('resize', () => {
  setRem();
});
