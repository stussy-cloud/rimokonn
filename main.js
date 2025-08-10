// デバッグHUD
(function(){ const box=document.createElement('div');
  box.style.cssText='position:fixed;left:8px;bottom:8px;background:rgba(0,0,0,.6);color:#fff;padding:6px 8px;border-radius:8px;font:12px system-ui;z-index:9';
  box.id='debugHud'; box.textContent='boot'; (document.readyState==='loading'?addEventListener('DOMContentLoaded',()=>document.body.appendChild(box)):document.body.appendChild(box));
  setInterval(()=>box.textContent='tick '+Math.floor(performance.now()/1000),800);
})();

cvs=document.getElementById('game'); ctx=cvs.getContext('2d'); resize();

// 初期カメラを中央へ
(function(){ const v=viewSizeWorld(); cam.x=(CONFIG.world.w-v.w)/2; cam.y=(CONFIG.world.h-v.h)/2; cam.z=0.6; sanitizeCam(); })();

let last=performance.now(), acc=0, interval = PERF.low? 1000/30 : 1000/60;

function loop(){
  const now=performance.now(), dt=Math.min(.033,(now-last)/1000); last=now; acc+=dt*1000;

  // 更新（毎フレーム）
  sanitizeCam(); updateEntities(dt);

  // 描画（間引き）
  if(acc>=interval){
    acc=0;
    try{
      if(typeof drawCityFast==='function') drawCityFast(); else throw new Error('drawCityFast not found');
    }catch(e){ setScreen(); ctx.fillStyle='#f66'; ctx.fillText('DRAW ERROR:'+e.message,12,18); setWorld(); }

    drawEntities();
  }
  requestAnimationFrame(loop);
}
initEntities(); loop();

// ===== 入力（パン／ズーム） =====
let fingers=new Map(), startDist=0,startZ=cam.z,startMid=null, dragging=false,lastMouse={x:0,y:0};
cvs.addEventListener('touchstart',e=>{e.preventDefault();
  for(const t of e.changedTouches) fingers.set(t.identifier,{x:t.clientX,y:t.clientY});
  if(fingers.size===2){ const [a,b]=[...fingers.values()]; startDist=Math.hypot(a.x-b.x,a.y-b.y); startZ=cam.z; startMid={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; }
},{passive:false});
cvs.addEventListener('touchmove',e=>{e.preventDefault();
  for(const t of e.changedTouches) if(fingers.has(t.identifier)) fingers.set(t.identifier,{x:t.clientX,y:t.clientY});
  if(fingers.size===2){ const [a,b]=[...fingers.values()]; const cur=Math.hypot(a.x-b.x,a.y-b.y); const scale=clamp(cur/startDist,0.3,3);
    const r=cvs.getBoundingClientRect(); const before=screenToWorld(startMid.x-r.left,startMid.y-r.top);
    cam.z=clamp(startZ*scale,zMin,zMax); const after=screenToWorld(startMid.x-r.left,startMid.y-r.top); cam.x+=before.x-after.x; cam.y+=before.y-after.y;
  } else if(fingers.size===1){ const cur=[...fingers.values()][0]; const prev=cur.prev||cur; const dx=(cur.x-(prev.x||cur.x))/cam.z, dy=(cur.y-(prev.y||cur.y))/cam.z;
    cam.x=clamp(cam.x-dx,0,CONFIG.world.w-viewSizeWorld().w); cam.y=clamp(cam.y-dy,0,CONFIG.world.h-viewSizeWorld().h); cur.prev={x:cur.x,y:cur.y}; }
},{passive:false});
cvs.addEventListener('touchend',e=>{for(const t of e.changedTouches) fingers.delete(t.identifier);},{passive:true});
cvs.addEventListener('touchcancel',e=>{for(const t of e.changedTouches) fingers.delete(t.identifier);},{passive:true});

cvs.addEventListener('mousedown',e=>{ if(e.button!==0){dragging=true; lastMouse={x:e.clientX,y:e.clientY};}});
addEventListener('mousemove',e=>{ if(!dragging) return; const dx=(e.clientX-lastMouse.x)/cam.z, dy=(e.clientY-lastMouse.y)/cam.z;
  cam.x=clamp(cam.x-dx,0,CONFIG.world.w-viewSizeWorld().w); cam.y=clamp(cam.y-dy,0,CONFIG.world.h-viewSizeWorld().h); lastMouse={x:e.clientX,y:e.clientY};});
addEventListener('mouseup',()=>dragging=false);
cvs.addEventListener('wheel',e=>{ e.preventDefault(); const r=cvs.getBoundingClientRect(); const mx=e.clientX-r.left,my=e.clientY-r.top;
  const before=screenToWorld(mx,my); cam.z=clamp(cam.z*(e.deltaY>0?0.9:1.1),zMin,zMax); const after=screenToWorld(mx,my); cam.x+=before.x-after.x; cam.y+=before.y-after.y;},{passive:false});
