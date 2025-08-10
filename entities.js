// 軽量な群衆（ワールド座標）
const POP = PERF.low ? {res:6,npcs:12} : {res:12,npcs:36};
let dots=[];

function initEntities(){
  dots=[];
  for(let i=0;i<POP.npcs;i++){
    dots.push({ x:rand(200,CONFIG.world.w-200), y:rand(200,CONFIG.world.h-200),
      vx:rand(-0.6,0.6), vy:rand(-0.6,0.6), c:pick(['#ff7aa2','#ffd166','#7bb6ff','#7bd389']) });
  }
}

function updateEntities(dt){
  for(const d of dots){
    d.x+=d.vx; d.y+=d.vy;
    if(d.x<100||d.x>CONFIG.world.w-100) d.vx*=-1;
    if(d.y<100||d.y>CONFIG.world.h-100) d.vy*=-1;
  }
}

function drawEntities(){
  for(const d of dots){
    ctx.fillStyle=d.c;
    ctx.beginPath(); ctx.arc(d.x,d.y,6,0,Math.PI*2); ctx.fill();
  }
}
