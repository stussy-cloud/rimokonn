'use strict';

/* 住人の超ミニマム実装（安全運転）
   - 外部 util は config.js の rand/pick/clamp のみ使用
   - デバッグ線は OFF。必要になったら FLAGS や URL でONにできます。
*/
const ENT = [];
const ENT_CFG = {
  n: 28,
  colors: ['#6ae','#fa8','#9f8','#f6a','#8cf','#ff9ad6','#7bd389','#ffd166']
};
const DEBUG_ENT = { rays: false }; // ← ここを true にすると線が出ます

function initEntities(){
  ENT.length = 0;
  for (let i=0;i<ENT_CFG.n;i++){
    ENT.push({
      x: rand(60, CONFIG.world.w-60),
      y: rand(60, CONFIG.world.h-60),
      vx: rand(-22,22),
      vy: rand(-22,22),
      r: 3.2,
      c: pick(ENT_CFG.colors)
    });
  }
}

function updateEntities(dt){
  for (const e of ENT){
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    // 反射
    if (e.x < 20 || e.x > CONFIG.world.w-20) e.vx *= -1;
    if (e.y < 20 || e.y > CONFIG.world.h-20) e.vy *= -1;
  }
}

function drawEntities(){
  // ここでは World 変換が既に掛かっている前提（main.js → drawCityFast → setWorld()）
  for (const e of ENT){
    // 本体
    ctx.fillStyle = e.c;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI*2); ctx.fill();

    // デバッグ線（無効）
    if (DEBUG_ENT.rays){
      ctx.strokeStyle = e.c; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + 40, e.y - 20); ctx.stroke();
    }
  }
}

window.initEntities   = initEntities;
window.updateEntities = updateEntities;
window.drawEntities   = drawEntities;
