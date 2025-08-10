// ====== 基本設定・ユーティリティ（モバイル最適化） ======
const PERF = {
  low: matchMedia('(max-width:700px)').matches || (navigator.hardwareConcurrency||4) <= 4
};
const DPR = PERF.low ? 1 : Math.max(1, Math.min(2, window.devicePixelRatio || 1));

const DEBUG_HUD = true;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[(Math.random()*a.length)|0];

const CONFIG={ world:{w:3600,h:2400,padding:100}, speed:1.18, focusedBoost:1.35, r:16, roadGap:240, roadW:36, sidewalk:18 };
const PALETTE={
  road:'#2a2f52', zebra:'#dfe7ff', grass:'#1d4d2c',
  buildBase:['#6ec1ff','#ffd166','#7bd389','#f49ac2','#95d0fc','#ffc2a8'],
  window:'#eff5ff', awning:'#ff6b6b',
  npcClothes:['#ff7aa2','#ffd166','#7bd389','#7bb6ff','#f49ac2','#95d0fc']
};

const ITEMS=[{id:'photo_short',label:'髪型(ショート)',icon:'📸'},{id:'photo_long',label:'髪型(ロング)',icon:'📸'},
  {id:'map',label:'地図',icon:'🗺️'},{id:'police',label:'交番',icon:'👮'},{id:'phone',label:'公衆電話',icon:'📞'},{id:'music',label:'音楽',icon:'♪'},{id:'light',label:'ひらめき',icon:'💡'}];
const NEEDS=[{id:'hair',icon:'💇',label:'髪型に迷い中'},{id:'lost',icon:'❓',label:'道に迷い中'}];
const STATIONS=[{id:'salon',icon:'💈',label:'サロン'},{id:'koban',icon:'👮',label:'交番'},{id:'phone',icon:'📞',label:'公衆電話'},{id:'home',icon:'🏠',label:'おうち'}];
const RULES={
  hair:{ photo_short:{ok:true,goTo:'salon',hair:'short',msg:'この髪型に！'}, photo_long:{ok:true,goTo:'salon',hair:'long',msg:'これで決まり！'} },
  lost:{ police:{ok:true,escort:true,goTo:'home',msg:'一緒に行きましょう'}, map:{ok:true,goTo:null,msg:'地図でわかった！'}, phone:{ok:false,stillLost:true,msg:'電話では解決せず…'} }
};

// ====== グローバル状態 ======
var cvs, ctx;
let buildings=[], parks=[], props=[], stationPoints=[], stations=[], inspirations=[];
let residents=[], npcs=[], animals=[], pulses=[], floaters=[];
let held=null;
const cam={x:0,y:0,z:0.6}; const zMin=0.45, zMax=2.2;

// ====== 変換・サイズ ======
function desired(){ const maxW=960,maxH=600,ratio=maxW/maxH;
  let vw=window.innerWidth-24, vh=window.innerHeight-(PERF.low?120:180);
  let w=Math.min(vw,maxW), h=Math.min(vh,maxH);
  w=Math.max(320,w); h=Math.max(260,h);
  if(w/h>ratio) w=h*ratio; else h=w/ratio;
  return {w:Math.round(w),h:Math.round(h)};
}
function viewSizeWorld(){ return { w:cvs.width/(DPR*cam.z), h:cvs.height/(DPR*cam.z) }; }
function resize(){ const s=desired(); cvs.style.width=s.w+'px'; cvs.style.height=s.h+'px'; cvs.width=Math.floor(s.w*DPR); cvs.height=Math.floor(s.h*DPR); }
addEventListener('resize',resize);
function setWorld(){ ctx.setTransform(DPR*cam.z,0,0,DPR*cam.z, -cam.x*DPR*cam.z, -cam.y*DPR*cam.z); }
function setScreen(){ ctx.setTransform(DPR,0,0,DPR,0,0); }
function screenToWorld(px,py){ return {x: cam.x + px/cam.z, y: cam.y + py/cam.z}; }
function sanitizeCam(){ if(!isFinite(cam.x)||!isFinite(cam.y)||!isFinite(cam.z)||cam.z<=0){ cam.x=0; cam.y=0; cam.z=0.6; } }
