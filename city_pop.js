'use strict';

let CITY_LAYER = null;
let CITY_SCALE = 0.42;
let CITY_W = 0, CITY_H = 0;
let CITY_NEEDS_REBUILD = true;

function RNDseed(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}
const RND = RNDseed(20250811);

(function(){
  if (!CanvasRenderingContext2D.prototype.roundRectF){
    CanvasRenderingContext2D.prototype.roundRectF = function(x,y,w,h,r){
      r=Math.max(0,Math.min(r,w/2,h/2));
      this.beginPath();
      this.moveTo(x+r,y);
      this.arcTo(x+w,y, x+w,y+h, r);
      this.arcTo(x+w,y+h, x,y+h, r);
      this.arcTo(x,y+h, x,y, r);
      this.arcTo(x,y, x+w,y, r);
      this.closePath(); return this;
    };
  }
})();

const THEME = {
  groundTop: '#0a0f26', groundBottom: '#0d1331',
  road: '#2a2f52', roadEdge: '#313863', crosswalk:'#eef3ff',
  blocks: ['#7dd3ff','#ffd166','#7bd389','#f49ac2','#a3d0ff','#ffc2a8','#a5f1d6','#ffe28a'],
  outline: '#0c0e23', outlineSoft:'#142047', parkFill:'#295840',
  treeTrunk:'#2a3a36', treeLeaf:'#6ad38b', lake:'#2d6bc0c8', lakeHi:'#8cc7ff66'
};

function pick(a){ return a[(RND()*a.length)|0]; }
function jit(a,b){ return a + RND()*(b-a); }

function buildCityLayerPop(){
  CITY_W = CONFIG.world.w; CITY_H = CONFIG.world.h;
  const can = document.createElement('canvas');
  can.width  = Math.max(1, Math.floor(CITY_W * CITY_SCALE));
  can.height = Math.max(1, Math.floor(CITY_H * CITY_SCALE));
  const g = can.getContext('2d'); g.imageSmoothingEnabled=true; g.scale(CITY_SCALE,CITY_SCALE);

  const grd=g.createLinearGradient(0,0,0,CITY_H); grd.addColorStop(0,THEME.groundTop); grd.addColorStop(1,THEME.groundBottom);
  g.fillStyle=grd; g.fillRect(0,0,CITY_W,CITY_H);

  const GAP=CONFIG.roadGap, RW=CONFIG.roadW;
  g.fillStyle=THEME.road; for(let x=0;x<CITY_W;x+=GAP) g.fillRect(x,0,RW,CITY_H);
  for(let y=0;y<CITY_H;y+=GAP) g.fillRect(0,y,CITY_W,RW);

  // 道路エッジ
  g.fillStyle=THEME.roadEdge; g.globalAlpha=0.25;
  for(let x=0;x<CITY_W;x+=GAP) g.fillRect(x+RW-1,0,1,CITY_H);
  for(let y=0;y<CITY_H;y+=GAP) g.fillRect(0,y+RW-1,CITY_W,1);
  g.globalAlpha=1;

  // 横断歩道
  g.fillStyle=THEME.crosswalk; g.globalAlpha=0.85;
  for(let x=0;x<CITY_W;x+=GAP*2){
    for(let y=0;y<CITY_H;y+=GAP*2){
      for(let i=0;i<60;i+=20){ g.fillRect(x-30+i, y+RW/2-5, 10, 10); }
      for(let i=0;i<60;i+=20){ g.fillRect(x+RW/2-5, y-30+i, 10, 10); }
    }
  }
  g.globalAlpha=1;

  // 舗装ノイズ
  g.globalAlpha=0.05; g.fillStyle='#ffffff';
  for(let i=0;i<4500;i++){ const x=RND()*CITY_W,y=RND()*CITY_H,s=RND()*1.4; g.fillRect(x,y,s,s); }
  g.globalAlpha=1;

  // 建物
  const corner=12; let bCount=0, pCount=0, lCount=0;
  for(let bx=60; bx<CITY_W-160; bx+=GAP){
    for(let by=60; by<CITY_H-160; by+=GAP){
      const n = 2 + ((bx+by/2)%3);
      for(let i=0;i<n;i++){
        const w=48+jit(0,70), h=40+jit(0,64);
        const x=bx+RW+16+jit(0, GAP-RW*2-w-32);
        const y=by+RW+16+jit(0, GAP-RW*2-h-32);

        // 影
        g.fillStyle='#00000035'; g.roundRectF(x+6,y+6,w,h,corner).fill();

        // 本体
        const body=pick(THEME.blocks); g.fillStyle=body; g.roundRectF(x,y,w,h,corner).fill(); bCount++;

        if (FLAGS.outlines){
          g.lineWidth=3; g.strokeStyle='#ffffff22';
          g.roundRectF(x+1.5,y+1.5,w-3,h-3,corner-2).stroke();
        }
        if (FLAGS.roofHL){
          g.fillStyle='#ffffff2a'; g.roundRectF(x+3,y+3,w-6,10,corner-4).fill();
        }
        // 窓帯（軽量）
        g.fillStyle='#ffffff20'; const rows = 1 + (RND()*2|0);
        for(let r=0;r<rows;r++){ g.fillRect(x+8, y+14+r*14, w-16, 6); }
      }
    }
  }

  // 公園
  if (FLAGS.parks){
    const parkEvery = GAP*4;
    for(let x=GAP*2; x<CITY_W; x+=parkEvery){
      for(let y=GAP; y<CITY_H; y+=parkEvery){
        if (RND()<0.38){
          const pw=GAP*0.9, ph=GAP*0.9;
          const px=x+RW+jit(0,GAP-RW*2-pw);
          const py=y+RW+jit(0,GAP-RW*2-ph);
          g.fillStyle=THEME.parkFill; g.roundRectF(px,py,pw,ph,14).fill();
          if (FLAGS.outlines){ g.strokeStyle=THEME.outlineSoft; g.lineWidth=2; g.globalAlpha=0.35; g.roundRectF(px,py,pw,ph,14).stroke(); g.globalAlpha=1; }
          g.fillStyle='#d7b693'; g.fillRect(px+pw*0.3, py+ph*0.55, pw*0.4, 6);
          const trees=3+(RND()*3|0);
          for(let t=0;t<trees;t++){
            const tx=px+16+jit(0,pw-32), ty=py+16+jit(0,ph-32);
            g.fillStyle=THEME.treeTrunk; g.fillRect(tx-2,ty+7,4,12);
            g.fillStyle=THEME.treeLeaf; g.beginPath(); g.arc(tx,ty,10+jit(0,6),0,Math.PI*2); g.fill();
            if (FLAGS.outlines){ g.strokeStyle=THEME.outline; g.globalAlpha=0.3; g.beginPath(); g.arc(tx,ty,10+jit(0,6),0,Math.PI*2); g.stroke(); g.globalAlpha=1; }
          }
          pCount++;
        }
      }
    }
  }

  // 湖
  if (FLAGS.lakes){
    const lakes = Math.max(1, (CITY_W*CITY_H)/720000);
    for(let i=0;i<lakes;i++){
      const cx=RND()*CITY_W, cy=RND()*CITY_H, r=70+RND()*140;
      g.fillStyle=THEME.lake; g.beginPath(); g.ellipse(cx,cy,r*1.2,r,0,0,Math.PI*2); g.fill();
      g.fillStyle=THEME.lakeHi; g.beginPath(); g.ellipse(cx-12, cy-10, r*0.92, r*0.76, 0, 0, Math.PI*2); g.fill();
      if (FLAGS.outlines){ g.strokeStyle='#70a7ff44'; g.lineWidth=2; g.beginPath(); g.ellipse(cx,cy,r*1.2,r,0,0,Math.PI*2); g.stroke(); }
      lCount++;
    }
  }

  CITY_LAYER = can; CITY_NEEDS_REBUILD=false;
  window.CITY_LAYER = CITY_LAYER; window.CITY_NEEDS_REBUILD = CITY_NEEDS_REBUILD;
  window.__diag && (__diag.counts = {buildings:bCount, parks:pCount, lakes:lCount});
}

function drawCityFast(){
  if (!CITY_LAYER || CITY_NEEDS_REBUILD || CITY_W!==CONFIG.world.w || CITY_H!==CONFIG.world.h) buildCityLayerPop();
  const dw=cvs.width/DPR, dh=cvs.height/DPR, vw=viewSizeWorld();
  const sx=cam.x*CITY_SCALE, sy=cam.y*CITY_SCALE, sw=vw.w*CITY_SCALE, sh=vw.h*CITY_SCALE;
  setScreen(); ctx.imageSmoothingEnabled=false; ctx.drawImage(CITY_LAYER, sx,sy,sw,sh, 0,0, dw,dh); setWorld();
}

addEventListener('resize', ()=>{ CITY_NEEDS_REBUILD=true; window.CITY_NEEDS_REBUILD=true; });

window.drawCityFast = drawCityFast;
