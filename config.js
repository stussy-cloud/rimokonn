'use strict';

// ===== 基本設定 =====
const DPR = Math.min(2, (window.devicePixelRatio||1));
let cvs, ctx;

const CONFIG = {
  world: { w: 2400, h: 1600 },
  roadGap: 180,
  roadW: 18,
};

// Feature Flags（pop 側のON/OFFに使用）
const FLAGS = {
  parks: true,     // 公園
  lakes: true,     // 湖
  outlines: true,  // 輪郭線
  roofHL: true,    // 屋根ハイライト
};

// パフォーマンス感度（低端末だと 30fps）
const PERF = { low: false };

// ===== カメラと座標変換 =====
const cam = { x: 0, y: 0, z: 0.6 };
const zMin = 0.35, zMax = 2.0;

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function viewSizeWorld(){
  const vw = (cvs.width  / DPR) / cam.z;
  const vh = (cvs.height / DPR) / cam.z;
  return { w: vw, h: vh };
}

function screenToWorld(px, py){
  const vx = px / cam.z;
  const vy = py / cam.z;
  return { x: cam.x + vx, y: cam.y + vy };
}

function setScreen(){ ctx.setTransform(1,0,0,1,0,0); }
function setWorld(){ ctx.setTransform(cam.z,0,0,cam.z, -cam.x*cam.z, -cam.y*cam.z); }

function sanitizeCam(){
  const v = viewSizeWorld();
  cam.x = clamp(cam.x, 0, CONFIG.world.w - v.w);
  cam.y = clamp(cam.y, 0, CONFIG.world.h - v.h);
  cam.z = clamp(cam.z, zMin, zMax);
}

function resize(){
  const r = cvs.getBoundingClientRect();
  cvs.width  = Math.max(1, Math.floor(r.width  * DPR));
  cvs.height = Math.max(1, Math.floor(r.height * DPR));
  setScreen(); ctx.clearRect(0,0,cvs.width/DPR,cvs.height/DPR); setWorld();
}

// 画面サイズに合わせる（キャンバスCSS）
(function mountCanvas(){
  cvs = document.getElementById('game');
  ctx = cvs.getContext('2d');
  // 親の中央に広く置く
  const wrap = cvs.parentElement;
  cvs.style.width = 'calc(100vw - 48px)';
  cvs.style.height = 'calc(70vh)';
  resize();
  addEventListener('resize', resize);
})();

window.CONFIG = CONFIG;
window.FLAGS = FLAGS;
window.PERF = PERF;
window.cam = cam;
window.viewSizeWorld = viewSizeWorld;
window.screenToWorld = screenToWorld;
window.setScreen = setScreen;
window.setWorld = setWorld;
window.resize = resize;
window.sanitizeCam = sanitizeCam;
window.clamp = clamp;
window.DPR = DPR;
