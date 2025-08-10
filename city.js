// ====== 街のジオメトリ＆描画 ======
function drawCrosswalk(x,y,w,h,step=10){ ctx.fillStyle=PALETTE.zebra; for(let i=0;i<w;i+=step*2){ ctx.fillRect(x+i,y,step,h); } }
function drawTree(x,y){ ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x,y+12,14,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#2e7d32'; ctx.beginPath(); ctx.arc(x,y,16,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#5b8a3a'; ctx.beginPath(); ctx.arc(x-8,y+2,10,0,Math.PI*2); ctx.arc(x+9,y+1,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#7b4a2b'; ctx.fillRect(x-3,y,6,16); }
function drawBench(x,y){ ctx.fillStyle='#a06c3f'; ctx.fillRect(x-18,y,36,6); ctx.fillRect(x-18,y-8,36,6); ctx.fillStyle='#6d4726'; ctx.fillRect(x-16,y+6,4,10); ctx.fillRect(x+12,y+6,4,10); }
function drawVending(x,y){ ctx.fillStyle='#4fa3ff'; ctx.roundRect(x-10,y-18,20,36,4); ctx.fill(); ctx.fillStyle='#eaf5ff'; ctx.fillRect(x-8,y-16,16,10); ctx.fillRect(x-8,y-4,16,12); ctx.fillStyle='#c8ddff'; ctx.fillRect(x-6,y-2,12,2); ctx.fillRect(x-6,y+2,12,2); }

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

  if(buildings.length===0){ // 最低保証
    buildings.push({x:400,y:300,w:120,h:80,type:'salon',c:'#6ec1ff'});
    stationPoints.push({x:460,y:340,type:'salon'});
  }
}

function drawBuilding(b){
  ctx.fillStyle='#1b1f3c'; ctx.fillRect(b.x-4, b.y-4, b.w+8, b.h+8); // 歩道
  ctx.fillStyle=b.c; ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=3; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.strokeRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#ffffff14'; ctx.fillRect(b.x, b.y, b.w, 6); // 屋根ライン
  ctx.fillStyle=PALETTE.window; const cols=Math.max(2,Math.floor(b.w/24)), rows=Math.max(1,Math.floor(b.h/28));
  for(let i=0;i<cols;i++){ for(let j=0;j<rows;j++){ const wx=b.x+8+i*(b.w-16)/(cols-1), wy=b.y+10+j*(b.h-18)/(rows-1); ctx.fillRect(wx-5,wy-6,10,12); } }
  if(['cafe','book','salon','koban','phone'].includes(b.type)){
    const label = b.type==='cafe'?'☕': b.type==='book'?'📚': b.type==='salon'?'💈': b.type==='koban'?'👮':'📞';
    ctx.fillStyle=PALETTE.awning; ctx.roundRect(b.x+6,b.y+b.h-18,40,14,6); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='12px system-ui'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText(label, b.x+12, b.y+b.h-11);
  }
}

function drawCity(){
  ctx.fillStyle='#0c1026'; ctx.fillRect(0,0,CONFIG.world.w,CONFIG.world.h); // 地面
  ctx.fillStyle=PALETTE.road; // 道路
  for(let x=0; x<CONFIG.world.w; x+=CONFIG.roadGap){ ctx.fillRect(x,0,CONFIG.roadW,CONFIG.world.h); }
  for(let y=0; y<CONFIG.world.h; y+=CONFIG.roadGap){ ctx.fillRect(0,y,CONFIG.world.w,CONFIG.roadW); }
  for(let x=0; x<CONFIG.world.w; x+=CONFIG.roadGap){ // 横断歩道
    for(let y=0; y<CONFIG.world.h; y+=CONFIG.roadGap){
      drawCrosswalk(x-30, y+CONFIG.roadW/2-6, 60, 12);
      drawCrosswalk(x+CONFIG.roadW/2-6, y-30, 12, 60);
    }
  }
  ctx.fillStyle=PALETTE.grass; for(const p of parks){ ctx.fillRect(p.x,p.y,p.w,p.h); }
  buildings.sort((a,b)=>a.y-b.y); for(const b of buildings){ drawBuilding(b); }
  for(const pr of props){ if(pr.kind==='tree') drawTree(pr.x,pr.y); if(pr.kind==='bench') drawBench(pr.x,pr.y); if(pr.kind==='vending') drawVending(pr.x,pr.y); }
}
