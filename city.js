// ===== 背景キャッシュ =====
let CITY_LAYER=null, CITY_SCALE=0.4;

function buildCityLayer(){
  const W=CONFIG.world.w, H=CONFIG.world.h;
  const can=document.createElement('canvas');
  can.width=Math.max(1,Math.floor(W*CITY_SCALE));
  can.height=Math.max(1,Math.floor(H*CITY_SCALE));
  const g=can.getContext('2d'); g.scale(CITY_SCALE,CITY_SCALE);

  // 地面
  g.fillStyle='#0c1026'; g.fillRect(0,0,W,H);

  // グリッド道路
  g.fillStyle='#2a2f52';
  for(let x=0;x<W;x+=CONFIG.roadGap){ g.fillRect(x,0,CONFIG.roadW,H); }
  for(let y=0;y<H;y+=CONFIG.roadGap){ g.fillRect(0,y,W,CONFIG.roadW); }

  // 交差点の簡易横断歩道
  g.fillStyle='#dfe7ff';
  for(let x=0;x<W;x+=CONFIG.roadGap){
    for(let y=0;y<H;y+=CONFIG.roadGap){
      for(let i=0;i<60;i+=20){ g.fillRect(x-30+i,y+CONFIG.roadW/2-6,10,12); }
      for(let i=0;i<60;i+=20){ g.fillRect(x+CONFIG.roadW/2-6,y-30+i,12,10); }
    }
  }

  // 建物ブロック（軽量）
  const colors=['#6ec1ff','#ffd166','#7bd389','#f49ac2','#95d0fc','#ffc2a8'];
  for(let bx=60; bx<W-180; bx+=CONFIG.roadGap){
    for(let by=60; by<H-180; by+=CONFIG.roadGap){
      const n=4+((bx+by/2)%3);
      for(let i=0;i<n;i++){
        const w=50+Math.random()*70, h=40+Math.random()*60;
        const x=bx+CONFIG.roadW+rand(20,CONFIG.roadGap-CONFIG.roadW*2-w-20);
        const y=by+CONFIG.roadW+rand(20,CONFIG.roadGap-CONFIG.roadW*2-h-20);
        g.fillStyle=pick(colors); g.fillRect(x,y,w,h);
        g.fillStyle='#ffffff14'; g.fillRect(x,y,w,6);
      }
    }
  }
  CITY_LAYER=can;
}

addEventListener('resize',()=>{ CITY_LAYER=null; });

function drawCityFast(){
  if(!CITY_LAYER) buildCityLayer();
  const dw=cvs.width/DPR, dh=cvs.height/DPR;           // 画面
  const vw=viewSizeWorld();                             // ワールド可視範囲
  const sx=cam.x*CITY_SCALE, sy=cam.y*CITY_SCALE;
  const sw=vw.w*CITY_SCALE, sh=vw.h*CITY_SCALE;

  setScreen();
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(CITY_LAYER, sx,sy,sw,sh, 0,0, dw,dh);
  setWorld();
}
