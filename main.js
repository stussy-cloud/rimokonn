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

// …上部はそのまま…

let last=performance.now();
let renderTimer=0, RENDER_INTERVAL = (PERF.low ? 1000/30 : 1000/60); // 低端末は30fps

function loop(){
  const now=performance.now();
  const dt=Math.min(.033,(now-last)/1000); last=now;
  renderTimer += dt*1000;

  // まず画面を塗る（見えていれば main.js は動いてる）
  setScreen(); ctx.fillStyle='#102040'; ctx.fillRect(0,0,cvs.width/DPR,cvs.height/DPR);

  // 更新（毎フレーム）
  sanitizeCam();
  for(const r of residents) r.update(dt);
  for(const n1 of npcs) n1.update(dt);
  for(const a of animals) a.update(dt);
  for(const f of floaters) f.update(dt); floaters=floaters.filter(f=>f.t<1.2);
  for(const p of pulses) p.update(dt); pulses=pulses.filter(p=>p.life>0);

  // 描画（端末に応じて間引き）
  if(renderTimer >= RENDER_INTERVAL){
    renderTimer = 0;

    // 背景はビューポートだけブリット
    // 背景は try-catch で安全に呼ぶ＋エラーを画面に表示
　　try {
　　  if (typeof drawCityFast === 'function') {
　　    drawCityFast();           // 新方式（ビューポートだけブリット）
　　　  } else if (typeof drawCity === 'function') {
　　    drawCity();               // 旧方式にフォールバック
　　　  } else {
　　    throw new Error('drawCityFast/drawCity が見つからない');
　　　  }
　　　　} catch (e) {
    
  // ここに来たら描画側が壊れてます。画面にエラーを出す
  setScreen();
  ctx.fillStyle = '#f66';
  ctx.font = 'bold 14px system-ui';
  ctx.fillText('DRAW ERROR: ' + e.message, 12, 42);
}

    // 動くもの
    const zlist=[...inspirations, ...animals, ...npcs, ...residents, ...floaters, ...pulses];
    zlist.sort((a,b)=>(a.y||0)-(b.y||0)); for(const it of zlist){ if(it.draw) it.draw(); }

    // HUD
    setScreen();
    const done=residents.filter(r=>r.state==='resolved').length;
    document.getElementById('status').innerHTML=`進捗: <b>${done}/${residents.length}</b> ／ 住人: ${residents.length} ／ 群衆: ${npcs.length} ／ 動物: ${animals.length} ／ 建物: ${buildings.length}`;
  }

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
