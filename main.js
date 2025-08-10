function mainLoop() {
  try {
    if (typeof drawCityFast === 'function') {
      drawCityFast();
    } else if (typeof drawCity === 'function') {
      drawCity();
    } else {
      throw new Error('背景描画関数が見つからない');
    }
  } catch (e) {
    setScreen();
    ctx.fillStyle = '#f66';
    ctx.fillText('DRAW ERROR: ' + e.message, 12, 42);
  }
  setWorld();

  updateEntities();
  drawEntities();

  requestAnimationFrame(mainLoop);
}

window.onload = () => {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  initEntities();
  mainLoop();
};
