'use strict';

// ---- レイヤ管理（依存なし） ----
let CITY_LAYER = null;
let CITY_SCALE = 0.4;      // 重ければ 0.35 まで下げ可
let CITY_W = 0, CITY_H = 0;
let CITY_NEEDS_REBUILD = false;

// 乱数（再現性のある軽量PRNG）
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}
const SEED = 1337;

// 背景レイヤを作る（他ファイルに依存しない）
function buildCityLayer(){
  CITY_W = (CONFIG && CONFIG.world && CONFIG.world.w) || 3600;
  CITY_H = (CONFIG && CONFIG.world && CONFIG.world.h) || 2400;

  const can = document.createElement('canvas');
  can.width  = Math.max(1, Math.floor(CITY_W * CITY_SCALE));
  can.height = Math.max(1, Math.floor(CITY_H * CITY_SCALE));
  const g = can.getContext('2d');
  g.scale(CITY_SCALE, CITY_SCALE);

  // 地面
  g.fillStyle = '#0c1026';
  g.fillRect(0, 0, CITY_W, CITY_H);

  // 道路グリッド
  const GAP = (CONFIG && CONFIG.roadGap) || 240;
  const RW  = (CONFIG && CONFIG.roadW)   || 36;
  g.fillStyle = '#2a2f52';
  for (let x=0; x<CITY_W; x+=GAP) g.fillRect(x, 0, RW, CITY_H);
  for (let y=0; y<CITY_H; y+=GAP) g.fillRect(0, y, CITY_W, RW);

  // 横断歩道（軽量）
  g.fillStyle = '#dfe7ff';
  for (let x=0; x<CITY_W; x+=GAP){
    for (let y=0; y<CITY_H; y+=GAP){
      for (let i=0;i<60;i+=20){ g.fillRect(x-30+i, y+RW/2-6, 10, 12); }
      for (let i=0;i<60;i+=20){ g.fillRect(x+RW/2-6, y-30+i, 12, 10); }
    }
  }

  // 建物（擬似ランダム）
  const rnd = mulberry32(SEED);
  const colors = ['#6ec1ff','#ffd166','#7bd389','#f49ac2','#95d0fc','#ffc2a8'];
  for (let bx=60; bx<CITY_W-180; bx+=GAP){
    for (let by=60; by<CITY_H-180; by+=GAP){
      const n = 3 + Math.floor(rnd()*3);
      for (let i=0;i<n;i++){
        const w = 50 + rnd()*70, h = 40 + rnd()*60;
        const x = bx + RW + 20 + rnd()*(GAP - RW*2 - w - 40);
        const y = by + RW + 20 + rnd()*(GAP - RW*2 - h - 40);
        g.fillStyle = colors[(rnd()*colors.length)|0];
        g.fillRect(x, y, w, h);
        g.fillStyle = '#ffffff14';
        g.fillRect(x, y, w, 6);
      }
    }
  }

  CITY_LAYER = can;
  CITY_NEEDS_REBUILD = false;
}

// 画面に合う部分だけブリット
function drawCityFast(){
  const need = !CITY_LAYER || CITY_NEEDS_REBUILD || CITY_W !== CONFIG.world.w || CITY_H !== CONFIG.world.h;
  if (need) buildCityLayer();

  const dw = cvs.width / DPR, dh = cvs.height / DPR;   // 画面サイズ
  const vw = viewSizeWorld();                           // 可視ワールド
  const sx = cam.x * CITY_SCALE, sy = cam.y * CITY_SCALE;
  const sw = vw.w * CITY_SCALE,  sh = vw.h * CITY_SCALE;

  setScreen();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(CITY_LAYER, sx, sy, sw, sh, 0, 0, dw, dh);
  setWorld();
}

// リサイズ時は「次フレームで作り直す」だけ
addEventListener('resize', () => { CITY_NEEDS_REBUILD = true; });
