// city.js

let CITY_LAYER = null;
let CITY_NEEDS_REBUILD = true;

function buildCityLayer(){
  const can = document.createElement('canvas');
  can.width = 1440;
  can.height = 960;
  const ctx = can.getContext('2d');

  // ===== あなたの描画処理ここから =====
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, can.width, can.height);
  // ===== あなたの描画処理ここまで =====

  CITY_LAYER = can;
  CITY_NEEDS_REBUILD = false;

  // 診断ローダー用に外に出す
  window.CITY_LAYER = CITY_LAYER;
  window.CITY_NEEDS_REBUILD = CITY_NEEDS_REBUILD;
}

function drawCityFast(ctx){
  if (!CITY_LAYER || CITY_NEEDS_REBUILD) {
    buildCityLayer();
  }
  ctx.drawImage(CITY_LAYER, 0, 0);
}

addEventListener('resize', () => {
  CITY_NEEDS_REBUILD = true;
  window.CITY_NEEDS_REBUILD = CITY_NEEDS_REBUILD;
});

// グローバル公開
window.drawCityFast = drawCityFast;
