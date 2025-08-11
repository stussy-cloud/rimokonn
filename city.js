'use strict';

let CITY_LAYER = null;
let CITY_SCALE = 0.4;        // 重ければ 0.35〜0.3 まで下げられます
let CITY_W = 0, CITY_H = 0;
let CITY_NEEDS_REBUILD = true;

// 超軽量 PRNG（背景の見た目を安定させる）
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}
const RND = mulberry32(1337);

// 背景レイヤ生成
function buildCityLayer(){
  CITY_W = CONFIG.world.w; CITY_H = CONFIG.world.h;

  const can = document.createElement('canvas');
  can.width  = Math.max(1, Math.floor(CITY_W * CITY_SCALE));
  can.height = Math.max(1, Math.floor(CITY_H * CITY_SCALE));
  const g = can.getContext('2d');
  g.scale(CITY_SCALE, CITY_SCALE);

  // 地面
  g.fillStyle = '#0c1026'; g.fillRect(0,0,CITY_W,CITY_H);

  // 道路グリッド
  const GAP=CONFIG.roadGap, RW=CONFIG.roadW;
  g.fillStyle='#2a2f52';
  for(let x=0;x<CITY_W;x+=GAP) g.fillRect(x,0,RW,CITY_H);
  for(let y=0;y<CITY_H;y+=GAP) g.fillRect(0,y,CITY_W,RW);

  // 横断歩道（間引き）
  g.fillStyle='#dfe7ff';
  for(let x=0;x<CITY_W;x+=GAP*2){
    for(let y=0;y<CITY_H;y+=GAP*2){
      for(let i=0;i<60;i+=20){ g.fillRect(x-30+i, y+RW/2-6, 10, 12); }
      for(let i=0;i<60;i+=20){ g.fillRect(x+RW/2-6, y-30+i, 12, 10); }
    }
  }

  // 建物（軽量）
  const colors=['#6ec1ff','#ffd166','#7bd389','#f49ac2','#95d0fc','#ffc2a8'];
  for(let bx=60; bx<CITY_W-180; bx+=GAP){
    for(let by=60; by<CITY_H-180; by+=GAP){
      const n = 2 + ((bx+by/2)%3);
      for(let i=0;i<n;i++){
        const w=50+RND()*70, h=40+RND()*60;
        const x=bx+RW+20+RND()*(GAP-RW*2-w-40);
        const y=by+RW+20+RND()*(GAP-RW*2-h-40);
        g.fillStyle = colors[(RND()*colors.length)|0];
        g.fillRect(x,y,w,h);
        g.fillStyle='#ffffff14'; g.fillRect(x,y,w,6);
      }
    }
  }

  CITY_LAYER = can;
  CITY_NEEDS_REBUILD = false;

  // HUD 用に可視化
  window.CITY_LAYER = CITY_LAYER;
  window.CITY_NEEDS_REBUILD = CITY_NEEDS_REBUILD;
}

// カメラ領域だけをブリット
function drawCityFast(){
  if (!CITY_LAYER || CITY_NEEDS_REBUILD || CITY_W!==CONFIG.world.w || CITY_H!==CONFIG.world.h){
    buildCityLayer();
  }

  const dw = cvs.width / DPR, dh = cvs.height / DPR;
  const vw = viewSizeWorld();
  const sx = cam.x * CITY_SCALE, sy = cam.y * CITY_SCALE;
  const sw = vw.w * CITY_SCALE,  sh = vw.h * CITY_SCALE;

  setScreen();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(CITY_LAYER, sx, sy, sw, sh, 0, 0, dw, dh);
  setWorld();
}

// リサイズ時は「次フレームで再生成」だけ
addEventListener('resize', ()=>{ CITY_NEEDS_REBUILD = true; window.CITY_NEEDS_REBUILD = true; });

// 公開
window.drawCityFast = drawCityFast;
