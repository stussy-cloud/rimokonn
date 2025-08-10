// ====== 強制デバッグHUD（DOMContentLoaded 済みでも表示） ======
(function(){
  if(!DEBUG_HUD) return;
  const box=document.createElement('div');
  box.style.cssText='position:fixed;left:8px;bottom:8px;background:rgba(0,0,0,.6);color:#fff;padding:6px 8px;border-radius:8px;font:12px/1.4 system-ui;z-index:99999';
  box.id='debugHud'; box.textContent='boot(main.js)';
  const mount=()=>document.body.appendChild(box);
  if(document.readyState==='loading'){ window.addEventListener('DOMContentLoaded',mount); } else { mount(); }
  const log=msg=>box.textContent=msg;
  window.addEventListener('error',e=>log('Error: '+e.message));
  window.addEventListener('unhandledrejection',e=>log('Promise: '+(e.reason&&e.reason.message||e.reason)));
  setInterval(()=>log('tick '+Math.floor(performance.now()/1000)),800);
})();

// SW登録（無ければ警告だけ）
if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
}

// Canvas取得
cvs=document.getElementById('game'); ctx=cvs.getContext('2d');

let last=performance.now();
function loop(){
  const n=performance.now(), dt=Math.min(.033,(n-last)/1000); last=n;

  // 画面を必ず塗る（これが見えれば main.js は動いている）
  setScreen(); ctx.fillStyle='#102040'; ctx.fillRect(0,0,cvs.width/DPR,cvs.height/DPR);
  ctx.fillStyle='#8cf'; ctx.font='bold 16px system-ui';
  ctx.fillText('BOOT OK', 12, 24);

  sanitizeCam();

  for(const r of residents) r.update(dt);
  for(const n1 of npcs) n1.update(dt);
  for(const a of animals) a.update(dt);
  for(const f of floaters) f.update(dt); floaters=floaters.filter(f=>f.t<1.2);
  for(const p of pulses) p.update(dt); pulses=pulses.filter(p=>p.life>0);

  setWorld();
  ctx.clearRect(cam.x, cam.y, viewSizeWorld().w, viewSizeWorld().h);
  drawCity(); for(const s of stations) s.draw();
  const zlist=[...inspirations, ...animals, ...npcs, ...residents, ...floaters, ...pulses];
  zlist.sort((a,b)=>(a.y||0)-(b.y||0)); for(const it of zlist){ if(it.draw) it.draw(); }

  setScreen();
  const done=residents.filter(r=>r.state==='resolved').length;
  document.getElementById('status').innerHTML=`進捗: <b>${done}/${residents.length}</b> ／ 住人: ${residents.length} ／ 群衆: ${npcs.length} ／ 動物: ${animals.length} ／ 建物: ${buildings.length}`;

  requestAnimationFrame(loop);
}

function initAll(){
  resize(); layoutWorld();
  const legend=document.getElementById('legend');
  legend.innerHTML = `<div><b>遊び方</b>：街に散らばるアイテム（📸🗺️👮📞♪💡）を拾い、住人に与える。悩みごとに反応/行き先/結末が変わる。</div>
    <div><b>操作</b>：ピンチ=ズーム、2本指ドラッグ=パン、＋/－ボタン=ズーム</div>
    <div><b>例</b>：💇×📸→💈で髪型チェンジ ／ ❓×👮→🏠まで付き添い ／ ❓×📞→まだ迷う</div>`;
  updateHeldUI(); loop();
}
initAll();

// ボタン
document.getElementById('dropBtn').onclick=()=>{ if(!held)return; const p=screenToWorld(cvs.width/(2*DPR),cvs.height/(2*DPR)); held.x=p.x; held.y=p.y; inspirations.push(held); held=null; updateHeldUI(); }
document.getElementById('resetBtn').onclick=()=>{ initAll(); }
document.getElementById('zin').onclick=()=>{ cam.z=clamp(cam.z*1.15,zMin,zMax); }
document.getElementById('zout').onclick=()=>{ cam.z=clamp(cam.z*0.87,zMin,zMax); }
