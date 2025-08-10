// ====== 街の生成 ======
function genCity(){
  buildings.length=0; parks.length=0; props.length=0; stationPoints.length=0;
  const G=CONFIG.roadGap, W=CONFIG.roadW, SW=CONFIG.sidewalk;

  for(let x=CONFIG.world.w*0.08; x<CONFIG.world.w*0.92; x+=G){
    for(let y=CONFIG.world.h*0.1; y<CONFIG.world.h*0.9; y+=G){
      const bx=x+W, by=y+W, bw=G-W*2, bh=G-W*2;

      if(Math.random()<0.12){
        parks.push({x:bx+8,y:by+8,w:bw-16,h:bh-16});
        for(let i=0;i<3;i++) props.push({kind:'tree',x:rand(bx+20,bx+bw-20),y:rand(by+20,by+bh-20)});
        props.push({kind:'bench',x:bx+bw*0.5,y:by+bh*0.7});
        continue;
      }

      const n=5+Math.floor(Math.random()*4);
      for(let i=0;i<n;i++){
        const w=52+Math.random()*70, h=34+Math.random()*60;
        const cx=bx+SW+Math.random()*(bw-w-SW*2), cy=by+SW+Math.random()*(bh-h-SW*2);
        const types=['cafe','book','home','apt','home','home','salon','koban','phone'];
        const t=pick(types);
        buildings.push({x:cx,y:cy,w,h,type:t,c:pick(PALETTE.buildBase)});
        if(['salon','koban','phone','home'].includes(t)){
          stationPoints.push({x:cx+w/2,y:cy+h/2,type:t});
        }
        if(Math.random()<0.3) props.push({kind:'vending',x:cx+w/2,y:cy+h/2+Math.min(h/2+18,30)});
        if(Math.random()<0.5) props.push({kind:'tree',x:cx+w+10,y:cy+h/2});
      }
    }
  }
  if(buildings.length===0){
    buildings.push({x:400,y:300,w:120,h:80,type:'salon',c:'#6ec1ff'});
    stationPoints.push({x:460,y:340,type:'salon'});
  }
}

// ====== 静的レイヤをキャッシュ ======
let CITY_LAYER=null;
function buildCityLayer(){
  const can=document.createElement('canvas');
  can.width=CONFIG.world.w; can.height=CONFIG.world.h;
  const g=can.getContext('2d');

  // 地面
  g.fillStyle='#0c1026'; g.fillRect(0,0,CONFIG.world.w,CONFIG.world.h);

  // 道路（グリッド）
  g.fillStyle=PALETTE.road;
  for(let x=0; x<CONFIG.world.w; x+=CONFIG.roadGap){ g.fillRect(x,0,CONFIG.roadW,CONFIG.world.h); }
  for(let y=0; y<CONFIG.world.h; y+=CONFIG.roadGap){ g.fillRect(0,y,CONFIG.world.w,CONFIG.roadW); }

  // 横断歩道
  const step=10;
  g.fillStyle=PALETTE.zebra;
  for(let x=0; x<CONFIG.world.w; x+=CONFIG.roadGap){
    for(let y=0; y<CONFIG.world.h; y+=CONFIG.roadGap){
      for(let i=0;i<60;i+=step*2){ g.fillRect(x-30+i, y+CONFIG.roadW/2-6, step, 12); }
      for(let i=0;i<60;i+=step*2){ g.fillRect(x+CONFIG.roadW/2-6, y-30+i, 12, step); }
    }
  }

  // 公園
  g.fillStyle=PALETTE.grass; for(const p of parks){ g.fillRect(p.x,p.y,p.w,p.h); }

  // 建物（軽量化：ウィンドウ密度を落とす）
  const density = PERF.low ? 0.6 : 1.0;
  for(const b of buildings.sort((a,b)=>a.y-b.y)){
    g.fillStyle='#1b1f3c'; g.fillRect(b.x-4,b.y-4,b.w+8,b.h+8);
    g.fillStyle=b.c; g.strokeStyle='rgba(0,0,0,.25)'; g.lineWidth=3; g.fillRect(b.x,b.y,b.w,b.h); g.strokeRect(b.x,b.y,b.w,b.h);
    g.fillStyle='#ffffff14'; g.fillRect(b.x,b.y,b.w,6);

    g.fillStyle=PALETTE.window;
    const cols=Math.max(2,Math.floor(b.w/24*density)), rows=Math.max(1,Math.floor(b.h/28*density));
    for(let i=0;i<cols;i++){
      for(let j=0;j<rows;j++){
        const wx=b.x+8+i*(b.w-16)/(cols-1), wy=b.y+10+j*(b.h-18)/(rows-1);
        g.fillRect(wx-5,wy-6,10,12);
      }
    }

    if(['cafe','book','salon','koban','phone'].includes(b.type)){
      const label=b.type==='cafe'?'☕': b.type==='book'?'📚': b.type==='salon'?'💈': b.type==='koban'?'👮':'📞';
      // 簡易オーニング
      g.fillStyle=PALETTE.awning; g.beginPath();
      g.moveTo(b.x+6,b.y+b.h-18); g.lineTo(b.x+46,b.y+b.h-18); g.lineTo(b.x+46,b.y+b.h-4); g.lineTo(b.x+6,b.y+b.h-4); g.closePath(); g.fill();
      g.fillStyle='#fff'; g.font='12px system-ui'; g.textAlign='left'; g.textBaseline='middle'; g.fillText(label, b.x+12, b.y+b.h-11);
    }
  }

  // 小物
  for(const pr of props){
    if(pr.kind==='tree'){
      g.fillStyle='rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(pr.x,pr.y+12,14,6,0,0,Math.PI*2); g.fill();
      g.fillStyle='#2e7d32'; g.beginPath(); g.arc(pr.x,pr.y,16,0,Math.PI*2); g.fill();
      g.fillStyle='#5b8a3a'; g.beginPath(); g.arc(pr.x-8,pr.y+2,10,0,Math.PI*2); g.arc(pr.x+9,pr.y+1,8,0,Math.PI*2); g.fill();
      g.fillStyle='#7b4a2b'; g.fillRect(pr.x-3,pr.y,6,16);
    }else if(pr.kind==='bench'){
      g.fillStyle='#a06c3f'; g.fillRect(pr.x-18,pr.y,36,6); g.fillRect(pr.x-18,pr.y-8,36,6);
      g.fillStyle='#6d4726'; g.fillRect(pr.x-16,pr.y+6,4,10); g.fillRect(pr.x+12,pr.y+6,4,10);
    }else if(pr.kind==='vending'){
      g.fillStyle='#4fa3ff'; g.fillRect(pr.x-10,pr.y-18,20,36);
      g.fillStyle='#eaf5ff'; g.fillRect(pr.x-8,pr.y-16,16,10); g.fillRect(pr.x-8,pr.y-4,16,12);
      g.fillStyle='#c8ddff'; g.fillRect(pr.x-6,pr.y-2,12,2); g.fillRect(pr.x-6,pr.y+2,12,2);
    }
  }

  CITY_LAYER = can;
}

// 毎フレームはキャッシュを貼るだけ
function drawCity(){
  if(!CITY_LAYER) buildCityLayer();
  ctx.drawImage(CITY_LAYER, 0, 0);
}
