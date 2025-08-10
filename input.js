// ====== 入力/UI ======
const heldIconEl = document.getElementById('heldIcon');
function updateHeldUI(){ const spec=held?ITEMS.find(i=>i.id===held.type):null; heldIconEl.textContent=held?(spec?spec.icon:'?')+' '+(spec?spec.label:held.type):'なし'; }
function nearest(list,x,y,rad){ let best=null,b=rad*rad; for(const o of list){const d=(o.x-x)**2+(o.y-y)**2; if(d<=b){b=d;best=o}} return best; }
function tryPickOrApplyWorld(wx,wy){
  if(!held){ const i=nearest(inspirations,wx,wy,28/cam.z); if(i){held=i; inspirations=inspirations.filter(o=>o!==i); updateHeldUI(); pulses.push(new Pulse(i.x,i.y,'#10e0ff')); return true;} return false; }
  const r=nearest(residents,wx,wy,44/cam.z); if(!r) return false; r.apply(held); held=null; updateHeldUI();
  const it=pick(ITEMS); inspirations.push(new Inspiration(wx+rand(-60,60), wy+rand(-60,60), it.id)); return true;
}

let fingers=new Map(), startDist=0,startZ=cam.z,startMid=null;
document.getElementById('game').addEventListener('touchstart',e=>{e.preventDefault();
  for(const t of e.changedTouches) fingers.set(t.identifier,{x:t.clientX,y:t.clientY});
  if(fingers.size===1){ const t=e.changedTouches[0], r=e.target.getBoundingClientRect(); const p=screenToWorld(t.clientX-r.left,t.clientY-r.top); tryPickOrApplyWorld(p.x,p.y); }
  if(fingers.size===2){ const [a,b]=[...fingers.values()]; startDist=Math.hypot(a.x-b.x,a.y-b.y); startZ=cam.z; startMid={x:(a.x+b.x)/2,y:(a.y+b.y)/2}; }
},{passive:false});
document.getElementById('game').addEventListener('touchmove',e=>{e.preventDefault();
  for(const t of e.changedTouches) if(fingers.has(t.identifier)) fingers.set(t.identifier,{x:t.clientX,y:t.clientY});
  if(fingers.size===2){ const [a,b]=[...fingers.values()]; const curDist=Math.hypot(a.x-b.x,a.y-b.y); const scale=clamp(curDist/startDist,0.3,3);
    const r=e.target.getBoundingClientRect(); const before=screenToWorld(startMid.x-r.left,startMid.y-r.top);
    cam.z=clamp(startZ*scale,zMin,zMax); const after=screenToWorld(startMid.x-r.left,startMid.y-r.top);
    cam.x+=before.x-after.x; cam.y+=before.y-after.y; const vs=viewSizeWorld(); cam.x=clamp(cam.x,0,CONFIG.world.w-vs.w); cam.y=clamp(cam.y,0,CONFIG.world.h-vs.h); }
},{passive:false});
document.getElementById('game').addEventListener('touchend',e=>{for(const t of e.changedTouches) fingers.delete(t.identifier);},{passive:true});
document.getElementById('game').addEventListener('touchcancel',e=>{for(const t of e.changedTouches) fingers.delete(t.identifier);},{passive:true});

let dragging=false,lastMouse={x:0,y:0};
document.getElementById('game').addEventListener('mousedown',e=>{
  if(e.button===0){ const r=e.target.getBoundingClientRect(); const p=screenToWorld(e.clientX-r.left,e.clientY-r.top); tryPickOrApplyWorld(p.x,p.y); }
  if(e.button===1||e.button===2){ dragging=true; lastMouse={x:e.clientX,y:e.clientY}; }
});
addEventListener('mousemove',e=>{ if(!dragging)return; const dx=(e.clientX-lastMouse.x)/cam.z, dy=(e.clientY-lastMouse.y)/cam.z;
  const vs=viewSizeWorld(); cam.x=clamp(cam.x-dx,0,CONFIG.world.w-vs.w); cam.y=clamp(cam.y-dy,0,CONFIG.world.h-vs.h); lastMouse={x:e.clientX,y:e.clientY}; });
addEventListener('mouseup',()=>dragging=false);
document.getElementById('game').addEventListener('contextmenu',e=>e.preventDefault());
document.getElementById('game').addEventListener('wheel',e=>{
  e.preventDefault(); const r=e.target.getBoundingClientRect(); const mx=e.clientX-r.left, my=e.clientY-r.top;
  const before=screenToWorld(mx,my); cam.z=clamp(cam.z*(e.deltaY>0?0.9:1.1),zMin,zMax); const after=screenToWorld(mx,my); cam.x+=before.x-after.x; cam.y+=before.y-after.y;
},{passive:false});
