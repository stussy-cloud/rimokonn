let CITY_LAYER = null, CITY_SCALE = 0.4;

function buildCityLayer() {
  const w = Math.floor(W * CITY_SCALE);
  const h = Math.floor(H * CITY_SCALE);
  CITY_LAYER = document.createElement('canvas');
  CITY_LAYER.width = w;
  CITY_LAYER.height = h;
  const cctx = CITY_LAYER.getContext('2d');
  cctx.fillStyle = '#bde0fe';
  cctx.fillRect(0, 0, w, h);

  // 簡易背景：道と建物
  for (let i = 0; i < 20; i++) {
    cctx.fillStyle = i % 2 ? '#ffafcc' : '#cdb4db';
    cctx.fillRect(rand(0, w - 50), rand(0, h - 50), rand(20, 50), rand(20, 50));
  }
}

function drawCityFast() {
  if (!CITY_LAYER) buildCityLayer();
  ctx.drawImage(CITY_LAYER, 0, 0, W, H);
}

addEventListener('resize', () => { CITY_LAYER = null; });
