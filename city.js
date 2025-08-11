'use strict';

let CITY_LAYER = null;
let CITY_SCALE = 0.4;        // 重ければ 0.35〜0.3 まで下げてOK
let CITY_W = 0, CITY_H = 0;
let CITY_NEEDS_REBUILD = true;

// 乱数（背景の安定用）
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}
const RND = mulberry32(20250811);

// 角丸矩形
CanvasRenderingContext2D.prototype.roundRectF = function(x,y,w,h,r){
  r=Math.min(r, w/2, h/2);
  this.beginPath();
  this.moveTo(x+r,y);
  this.arcTo(x+w,y, x+w,y+h, r);
  this.arcTo(x+w,y+h, x,y+h, r);
  this.arcTo(x,y+h, x,y, r);
  this.arcTo(x,y, x+w,y, r);
  this.closePath();
  return this;
};

function buildCityLayer(){
  CITY_W = CONFIG.world.w; 
  CITY_H = CONFIG.world.h;

  const can = document.createElement('canvas');
  can.width  = Math.max(1, Math.floor(CITY_W * CITY_SCALE));
  can.height = Math.max(1, Math.floor(CITY_H * CITY_SCALE));
  const g = can.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.scale(CITY_SCALE, CITY_SCALE);

  // 地面グラデ
  const grd = g.createLinearGradient(0,0,0,CITY_H);
  grd.addColorStop(0,'#0a0f26');
  grd.addColorStop(1,'#0c122e');
  g.fillStyle = grd; g.fillRect(0,0,CITY_W,CITY_H);

  // 道路グリッド
  const GAP=CONFIG.roadGap, RW=CONFIG.roadW;
  g.fillStyle='#262b4a';
  for(let x=0;x<CITY_W;x+=GAP) g.fillRect(x,0,RW,CITY_H);
  for(let y=0;y<CITY_H;y+=GAP) g.fillRect(0,y,CITY_W,RW);

  // 舗装の微小ノイズ
  g.globalAlpha=0.08; g.fillStyle='#ffffff';
  for(let i=0;i<8000;i++){
    const x=RND()*CITY_W,y=RND()*CITY_H,s=RND()*1.5;
    g.fillRect(x,y,s,s);
  }
  g.globalAlpha=1;

  // 横断歩道（控えめ）
  g.fillStyle='#e6eeff';
  for(let x=0;x<CITY_W;x+=GAP*2){
    for(let y=0;y<CITY_H;y+=GAP*2){
      for(let i=0;i<60;i+=20){ g.fillRect(x-30+i, y+RW/2-5, 10, 10); }
      for(let i=0;i<60;i+=20){ g.fillRect(x+RW/2-5, y-30+i, 10, 10); }
    }
  }

  // 建物カラー
  const colors=['#6ec1ff','#ffd166','#7bd389','#f49ac2','#95d0fc','#ffc2a8','#a5f1d6','#ffe28a'];

  // 建物（角丸＋屋根ハイライト＋影）
  for(let bx=60; bx<CITY_W-180; bx+=GAP){
    for(let by=60; by<CITY_H-180; by+=GAP){
      const n = 2 + ((bx+by/2)%3);
      for(let i=0;i<n;i++){
        const w=46+RND()*74, h=36+RND()*66;
        const x=bx+RW+18+RND()*(GAP-RW*2-w-36);
        const y=by+RW+18+RND()*(GAP-RW*2-h-36);

        // 影
        g.fillStyle='#00000033';
        g.roundRectF(x+6,y+6,w,h,10).fill();

        // 本体
        const c = colors[(RND()*colors.length)|0];
        g.fillStyle=c;
        g.roundRectF(x,y,w,h,10).fill();

        // 屋根ハイライト
        g.fillStyle='#ffffff22';
        g.roundRectF(x+2,y+2,w-4,8,6).fill();

        // 入口風の模様
        g.fillStyle='#00000020';
        g.fillRect(x+w*0.4,y+h-10, w*0.2, 8);
      }
    }
  }

  // 公園（芝＋木）
  const parkEvery = GAP*4;
  for(let x=GAP*2; x<CITY_W; x+=parkEvery){
    for(let y=GAP; y<CITY_H; y+=parkEvery){
      if (RND()<0.35){
        const pw=GAP*0.9, ph=GAP*0.9;
        const px=x+RW+RND()*(GAP-RW*2-pw);
        const py=y+RW+RND()*(GAP-RW*2-ph);
        g.fillStyle='#254e3a'; g.roundRectF(px,py,pw,ph,14).fill();
        // ベンチ
        g.fillStyle='#d3b48a'; g.fillRect(px+pw*0.3, py+ph*0.55, pw*0.4, 6);
        // 木
        const trees=3+(RND()*3|0);
        for(let t=0;t<trees;t++){
          const tx=px+16+RND()*(pw-32), ty=py+16+RND()*(ph-32);
          g.fillStyle='#1b3d2e'; g.fillRect(tx-2,ty+6,4,12);
          g.fillStyle='#62c178'; g.beginPath(); g.arc(tx,ty,10+RND()*6,0,Math.PI*2); g.fill();
        }
      }
    }
  }

  // 水辺（湖）
  const lakes = Math.max(1, (CITY_W*CITY_H)/800000);
  for(let i=0;i<lakes;i++){
    const cx = RND()*CITY_W, cy = RND()*CITY_H, r = 60 + RND()*140;
    g.fillStyle='#2a65a8aa';
    g.beginPath();
    g.ellipse(cx, cy, r*1.2, r, 0, 0, Math.PI*2);
    g.fill();
    g.fillStyle='#78b6ff55';
    g.beginPath();
    g.ellipse(cx-10, cy-8, r*0.9, r*0.75, 0, 0, Math.PI*2);
    g.fill();
  }

  CITY_LAYER = can;
  CITY_NEEDS_REBUILD = false;

  // HUD 用に可視化
  window.CITY_LAYER = CITY_LAYER;
  window.CITY_NEEDS_REBUILD = CITY_NEEDS_REBUILD;
}

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

addEventListener('resize', ()=>{ CITY_NEEDS_REBUILD = true; window.CITY_NEEDS_REBUILD = true; });

window.drawCityFast = drawCityFast;
