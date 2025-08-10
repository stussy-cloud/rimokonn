// ===== モバイル最適化 + カメラ/座標ユーティリティ =====
const PERF = { low: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) };
const DPR = 1;                         // 超安定（必要なら 2 に戻せます）
const CONFIG = { world:{w:3600,h:2400,padding:100}, roadGap:240, roadW:36 };
let cvs, ctx;
const cam = { x:0, y:0, z:0.6 };       // z: ズーム倍率
const zMin = 0.45, zMax = 2.0;

const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[(Math.random()*a.length)|0];

function desired(){ const maxW=960,maxH=600,ratio=maxW/maxH;
  let vw=innerWidth-24, vh=innerHeight-(PERF.low?120:180);
  let w=Math.min(vw,maxW), h=Math.min(vh,maxH); w=Math.max(320,w); h=Math.max(260,h);
  if(w/h>ratio) w=h*ratio; else h=w/ratio; return {w:Math.round(w),h:Math.round(h)};
}
function viewSizeWorld(){ return { w:cvs.width/(DPR*cam.z), h:cvs.height/(DPR*cam.z) }; }

function resize(){
  const s=desired(); cvs.style.width=s.w+'px'; cvs.style.height=s.h+'px';
  cvs.width=Math.floor(s.w*DPR); cvs.height=Math.floor(s.h*DPR);
}
addEventListener('resize', resize);

function setWorld(){ ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z, -cam.x*DPR*cam.z, -cam.y*DPR*cam.z); }
function setScreen(){ ctx.setTransform(DPR,0,0,DPR,0,0); }
function screenToWorld(px,py){ return {x: cam.x + px/cam.z, y: cam.y + py/cam.z}; }
function sanitizeCam(){
  const v=viewSizeWorld();
  cam.x=clamp(cam.x,0,CONFIG.world.w-v.w);
  cam.y=clamp(cam.y,0,CONFIG.world.h-v.h);
  cam.z=clamp(cam.z,zMin,zMax);
}
