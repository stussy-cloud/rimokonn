'use strict';

// ====== 起動 ======
cvs = document.getElementById('game');
ctx = cvs.getContext('2d');
resize();

// 初期カメラ（中心）
(function initCamCenter() {
  const v = viewSizeWorld();
  cam.x = (CONFIG.world.w - v.w) / 2;
  cam.y = (CONFIG.world.h - v.h) / 2;
  cam.z = 0.6;
  sanitizeCam();
})();

// モバイルはヘルプ閉じ
try { if (PERF.low) document.getElementById('legendWrap').open = false; } catch(e){}

// ====== HUD 診断 ======
const __V = new URLSearchParams(location.search).get('v') || 'dev';
function diag() {
  const st = document.getElementById('status');
  if (!st) return;
  const ok = (x)=> typeof x!=='undefined' ? (typeof x==='function'?'ƒ':'●') : '×';
  const size = (c)=> (c && c.width) ? `${c.width}x${c.height}` : 'null';
  st.innerHTML = `build:<b>${__V}</b> / drawCityFast:${ok(drawCityFast)} / CITY_LAYER:${size(window.CITY_LAYER)} / cam:x=${cam.x.toFixed(1)} y=${cam.y.toFixed(1)} z=${cam.z.toFixed(2)}`;
}
addEventListener('error', e => { const st=document.getElementById('status'); if(st) st.innerHTML = 'SCRIPT ERROR: ' + (e.message||e.type); });
addEventListener('unhandledrejection', e => { const st=document.getElementById('status'); if(st) st.innerHTML = 'PROMISE ERROR: ' + (e.reason&&e.reason.message||e.reason); });

// ====== ループ ======
let last = performance.now();
let acc = 0;
let interval = PERF.low ? 1000/30 : 1000/60;

function loop(){
  const now = performance.now();
  const dt = Math.min(0.033, (now - last)/1000);
  last = now; acc += dt*1000;

  sanitizeCam();
  if (typeof updateEntities === 'function') updateEntities(dt);

  if (acc >= interval){
    acc = 0;

    // 背景：常に drawCityFast を呼ぶ（内部で必要なら再生成）
    try{
      if (typeof drawCityFast === 'function') {
        drawCityFast();
      } else if (typeof drawCity === 'function') {
        drawCity();
      } else {
        throw new Error('drawCityFast/drawCity not found');
      }
    }catch(e){
      setScreen(); ctx.fillStyle='#f66'; ctx.font='bold 14px system-ui';
      ctx.fillText('DRAW ERROR: ' + e.message, 12, 18); setWorld();
    }

    if (typeof drawEntities === 'function') drawEntities();

    diag();
  }

  requestAnimationFrame(loop);
}

// 初期生成
if (typeof initEntities === 'function') initEntities();
loop();

// ====== 入力（ピンチ＝ズーム、1本指ドラッグ＝パン、ホイールズーム、＋/−） ======
function zoomAt(px, py, factor){
  const before = screenToWorld(px, py);
  cam.z = clamp(cam.z * factor, zMin, zMax);
  const after = screenToWorld(px, py);
  cam.x += before.x - after.x;
  cam.y += before.y - after.y;
  sanitizeCam();
}

// タッチ
let fingers = new Map(); let startDist=0,startZ=cam.z,startMid=null;
function distance(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
function midpoint(a,b){ return {x:(a.x+b.x)/2, y:(a.y+b.y)/2}; }

cvs.addEventListener('touchstart',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){ fingers.set(t.identifier,{x:t.clientX,y:t.clientY,dx:0,dy:0}); }
  if (fingers.size===2){ const [a,b]=[...fingers.values()]; startDist=distance(a,b); startZ=cam.z; startMid=midpoint(a,b); }
},{passive:false});

cvs.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    const o=fingers.get(t.identifier); if(!o) continue;
    o.dx=t.clientX-o.x; o.dy=t.clientY-o.y; o.x=t.clientX; o.y=t.clientY;
  }
  if (fingers.size===2){
    const [a,b]=[...fingers.values()]; const cur=distance(a,b);
    const scale = clamp(cur/Math.max(1,startDist), 0.3, 3);
    const r=cvs.getBoundingClientRect();
    const before=screenToWorld(startMid.x-r.left, startMid.y-r.top);
    cam.z = clamp(startZ*scale, zMin, zMax);
    const after=screenToWorld(startMid.x-r.left, startMid.y-r.top);
    cam.x += before.x-after.x; cam.y += before.y-after.y;
  } else if (fingers.size===1){
    const [f]=[...fingers.values()];
    const v=viewSizeWorld();
    cam.x = clamp(cam.x - f.dx/cam.z, 0, CONFIG.world.w - v.w);
    cam.y = clamp(cam.y - f.dy/cam.z, 0, CONFIG.world.h - v.h);
  }
  sanitizeCam();
},{passive:false});

function endTouches(e){ for(const t of e.changedTouches) fingers.delete(t.identifier); }
cvs.addEventListener('touchend',endTouches,{passive:true});
cvs.addEventListener('touchcancel',endTouches,{passive:true});

// マウス
let dragging=false, lastMouse={x:0,y:0};
cvs.addEventListener('mousedown', e=>{ dragging=true; lastMouse={x:e.clientX,y:e.clientY}; });
addEventListener('mousemove', e=>{
  if(!dragging) return;
  const dx=(e.clientX-lastMouse.x)/cam.z, dy=(e.clientY-lastMouse.y)/cam.z;
  const v=viewSizeWorld();
  cam.x = clamp(cam.x - dx, 0, CONFIG.world.w - v.w);
  cam.y = clamp(cam.y - dy, 0, CONFIG.world.h - v.h);
  lastMouse={x:e.clientX,y:e.clientY};
});
addEventListener('mouseup', ()=> dragging=false);

cvs.addEventListener('wheel', e=>{
  e.preventDefault();
  const r=cvs.getBoundingClientRect();
  zoomAt(e.clientX-r.left, e.clientY-r.top, e.deltaY>0?0.9:1.1);
},{passive:false});

// ＋ / －
(() => {
  const zin=document.getElementById('zin'), zout=document.getElementById('zout');
  if(!zin||!zout) return;
  const cx=()=>cvs.width/(2*DPR), cy=()=>cvs.height/(2*DPR);
  zin.addEventListener('click', ()=>zoomAt(cx(),cy(),1.15));
  zout.addEventListener('click', ()=>zoomAt(cx(),cy(),0.87));
})();
