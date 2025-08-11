'use strict';

let CITY_LAYER = null;
let CITY_SCALE = 0.40;
let CITY_W = 0, CITY_H = 0;
let CITY_NEEDS_REBUILD = true;

function reportCity(e){
  try{
    const st = document.getElementById('status');
    if (st) st.innerHTML = (st.innerHTML||'') + ' / city_safe:' + (e && e.message ? e.message : e);
  }catch(_){}
}

// 角丸polyfill（安全）
(function(){
  try{
    if (typeof CanvasRenderingContext2D !== 'undefined'){
      const proto = CanvasRenderingContext2D.prototype;
      if (!Object.prototype.hasOwnProperty.call(proto,'roundRectF')){
        Object.defineProperty(proto,'roundRectF',{value:function(x,y,w,h,r){
          r=Math.max(0,Math.min(r,w/2,h/2));
          this.beginPath();
          this.moveTo(x+r,y);
          this.arcTo(x+w,y, x+w,y+h, r);
          this.arcTo(x+w,y+h, x,y+h, r);
          this.arcTo(x,y+h, x,y, r);
          this.arcTo(x,y, x+w,y, r);
          this.closePath(); return this;
        }});
      }
    }
  }catch(e){ reportCity(e); }
})();

function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}
const RND_SAFE = mulberry32(1337);

function buildCityLayerSafe(){
  try{
    CITY_W = CONFIG.world.w; CITY_H = CONFIG.world.h;
    const can = document.createElement('canvas');
    can.width  = Math.max(1, Math.floor(CITY_W * CITY_SCALE));
    can.height = Math.max(1, Math.floor(CITY_H * CITY_SCALE));
    const g = can.getContext('2d'); g.imageSmoothingEnabled=true; g.scale(CITY_SCALE,CITY_SCALE);

    const grd = g.createLinearGradient(0,0,0,CITY_H);
    grd.addColorStop(0,'#0a0f26'); grd.addColorStop(1,'#0d1331');
    g.fillStyle=grd; g.fillRect(0,0,CITY_W,CITY_H);

    const GAP=CONFIG.roadGap, RW=CONFIG.roadW;
    g.fillStyle='#2a2f52';
    for(let x=0;x<CITY_W;x+=GAP) g.fillRect(x,0,RW,CITY_H);
    for(let y=0;y<CITY_H;y+=GAP) g.fillRect(0,y,CITY_W,RW);

    const colors=['#7dd3ff','#ffd166','#7bd389','#f49ac2','#a3d0ff','#ffc2a8','#a5f1d6','#ffe28a'];
    for(let bx=60; bx<CITY_W-160; bx+=GAP){
      for(let by=60; by<CITY_H-160; by+=GAP){
        const n = 2 + ((bx+by/2)%3);
        for(let i=0;i<n;i++){
          const w=48+RND_SAFE()*70, h=40+RND_SAFE()*64;
          const x=bx+RW+16+RND_SAFE()*(GAP-RW*2-w-32);
          const y=by+RW+16+RND_SAFE()*(GAP-RW*2-h-32);
          g.fillStyle='#00000033'; g.roundRectF(x+6,y+6,w,h,12).fill();
          g.fillStyle=colors[(RND_SAFE()*colors.length)|0];
          g.roundRectF(x,y,w,h,12).fill();
          g.fillStyle='#ffffff22'; g.roundRectF(x+3,y+3,w-6,10,8).fill();
        }
      }
    }

    CITY_LAYER = can; CITY_NEEDS_REBUILD=false;
    window.CITY_LAYER = CITY_LAYER; window.CITY_NEEDS_REBUILD = CITY_NEEDS_REBUILD;
    window.__diag && (__diag.counts = {b:'~many', parks:0, lakes:0});
  }catch(e){ reportCity(e); throw e; }
}

function drawCityFast(){
  try{
    if (!CITY_LAYER || CITY_NEEDS_REBUILD || CITY_W!==CONFIG.world.w || CITY_H!==CONFIG.world.h) buildCityLayerSafe();
    const dw=cvs.width/DPR, dh=cvs.height/DPR, vw=viewSizeWorld();
    const sx=cam.x*CITY_SCALE, sy=cam.y*CITY_SCALE, sw=vw.w*CITY_SCALE, sh=vw.h*CITY_SCALE;
    setScreen(); ctx.imageSmoothingEnabled=false; ctx.drawImage(CITY_LAYER, sx,sy,sw,sh, 0,0, dw,dh); setWorld();
  }catch(e){ reportCity(e); setScreen(); ctx.fillStyle='#0b1028'; ctx.fillRect(0,0,cvs.width/DPR,cvs.height/DPR); setWorld(); }
}

addEventListener('resize', ()=>{ CITY_NEEDS_REBUILD=true; window.CITY_NEEDS_REBUILD=true; });

window.drawCityFast = drawCityFast;
