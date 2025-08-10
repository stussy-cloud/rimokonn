// ====== エンティティ ======
class Pulse{constructor(x,y,c){this.x=x;this.y=y;this.r=0;this.life=1;this.c=c||'#3ee0ff'} update(dt){this.r+=260*dt;this.life-=.8*dt}
  draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.strokeStyle=`${this.c}AA`;ctx.lineWidth=2;ctx.stroke();}}
class Floater{constructor(x,y,txt,col){this.x=x;this.y=y;this.t=0;this.txt=txt;this.col=col||'#fff'} update(dt){this.t+=dt;this.y-=18*dt}
  draw(){const a=Math.max(0,1-this.t/1.2); if(a<=0)return; ctx.save(); ctx.globalAlpha=a; ctx.font='bold 14px system-ui'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillStyle=this.col; ctx.fillText(this.txt,this.x,this.y); ctx.restore();}}
class Station{constructor(x,y,type){this.x=x;this.y=y;this.type=type}
  draw(){ctx.save(); ctx.fillStyle='rgba(255,255,255,.10)'; ctx.roundRect(this.x-24,this.y-16,48,32,8); ctx.fill();
    const spec=STATIONS.find(s=>s.id===this.type); ctx.font='20px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(spec?spec.icon:'?',this.x,this.y); ctx.restore();}}
class Inspiration{constructor(x,y,type){this.x=x;this.y=y;this.type=type}
  draw(){const spec=ITEMS.find(i=>i.id===this.type); ctx.save(); ctx.font='22px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(spec?spec.icon:'?',this.x,this.y); ctx.restore();}}

function drawPerson(x,y,cl,face,hair,step,hasBag=false){
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x,y+12,14,6,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#1d203c'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x-6,y+8); ctx.lineTo(x-6+step*2,y+16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+6,y+8); ctx.lineTo(x+6-step*2,y+16); ctx.stroke();
  ctx.fillStyle=cl; ctx.beginPath(); ctx.roundRect(x-12,y-6,24,26,8); ctx.fill();
  if(hasBag){ ctx.fillStyle='#333'; ctx.beginPath(); ctx.roundRect(x+6,y-2,8,10,3); ctx.fill(); }
  ctx.strokeStyle='#2d3058'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x-12,y); ctx.lineTo(x-20,y+6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+12,y); ctx.lineTo(x+20,y+6); ctx.stroke();
  ctx.fillStyle='#ffe'; ctx.beginPath(); ctx.arc(x,y-10,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=hair.color;
  if(hair.style==='short'){ ctx.beginPath(); ctx.arc(x,y-14,11,Math.PI*1.1,Math.PI*1.9); ctx.lineTo(x+10,y-8); ctx.closePath(); ctx.fill(); }
  if(hair.style==='long'){ ctx.beginPath(); ctx.arc(x,y-15,12,Math.PI*1.1,Math.PI*1.9); ctx.lineTo(x+10,y+2); ctx.arc(x,y+4,12,0,Math.PI,true); ctx.closePath(); ctx.fill(); }
  if(hair.style==='ponytail'){ ctx.beginPath(); ctx.arc(x,y-14,10,Math.PI*1.1,Math.PI*1.9); ctx.fill(); ctx.beginPath(); ctx.ellipse(x+8,y-7,4,8,0,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle='#333';
  if(face==='happy'){ ctx.beginPath(); ctx.arc(x-4,y-11,1.6,0,Math.PI*2); ctx.arc(x+4,y-11,1.6,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#333'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(x,y-6,5,0,Math.PI,false); ctx.stroke(); }
  else if(face==='lost'){ ctx.beginPath(); ctx.arc(x-4,y-11,1.6,0,Math.PI*2); ctx.arc(x+4,y-11,1.6,0,Math.PI*2); ctx.fill(); ctx.fillRect(x-4,y-6,8,2); }
  else { ctx.beginPath(); ctx.arc(x-4,y-11,1.4,0,Math.PI*2); ctx.arc(x+4,y-11,1.4,0,Math.PI*2); ctx.fill(); ctx.fillRect(x-4,y-6,8,2); }
}

class Resident{
  constructor(x,y,ci,need,look){ this.x=x;this.y=y;this.vx=0;this.vy=0;this.ci=ci;this.need=need;
    this.state='idle'; this.goal=null; this.face='meh'; this.hair=null; this.escort=false;
    this.look=look; this.walkPhase=Math.random()*Math.PI*2; }
  setGoal(x,y){this.goal={x,y}; this.state='focused'}
  goStation(type){ const list=stations.filter(s=>s.type===type); if(!list.length)return false;
    let best=list[0],bd=Infinity; for(const s of list){const d=(s.x-this.x)**2+(s.y-this.y)**2; if(d<bd){bd=d;best=s;}}
    this.setGoal(best.x,best.y); return true; }
  apply(item){
    const rule=(RULES[this.need]||{})[item.type]; if(!rule){floaters.push(new Floater(this.x,this.y-18,'？','#fff7c2')); return;}
    if(rule.ok){
      if(rule.hair) this.hair={style:rule.hair,color:this.look.hair.color};
      if(rule.escort) this.escort=true;
      this.face='happy'; if(rule.goTo) this.goStation(rule.goTo); else this.state='resolved';
      pulses.push(new Pulse(this.x,this.y,'#1df294')); floaters.push(new Floater(this.x,this.y-18,rule.msg||'OK','#baffd9'));
    }else{
      this.face=(this.need==='lost'&&rule.stillLost)?'lost':'meh';
      if(rule.goTo) this.goStation(rule.goTo);
      pulses.push(new Pulse(this.x,this.y,'#ff6b6b')); floaters.push(new Floater(this.x,this.y-18,rule.msg||'…','#ffd0d0'));
    }
  }
  update(dt){
    const sp=CONFIG.speed*(this.state==='focused'?CONFIG.focusedBoost:1)*(this.escort?1.1:1);
    this.walkPhase+=dt*6;
    if(this.state==='focused'&&this.goal){
      const dx=this.goal.x-this.x, dy=this.goal.y-this.y, d=Math.hypot(dx,dy)||1, ux=dx/d, uy=dy/d;
      this.vx+=(ux*sp-this.vx)*0.2; this.vy+=(uy*sp-this.vy)*0.2; this.x+=this.vx; this.y+=this.vy;
      if(d<18){
        if(this.need==='hair'){ this.state='resolved'; this.face='happy'; }
        else if(this.need==='lost'&&this.escort){ this.state='resolved'; this.face='happy'; this.escort=false; }
        else { this.state='resolved'; }
      }
    }else{
      this.vx+=(Math.random()-.5)*0.06; this.vy+=(Math.random()-.5)*0.06;
      const v=Math.hypot(this.vx,this.vy)||1, max=sp*0.7; if(v>max){this.vx=this.vx/v*max; this.vy=this.vy/v*max;}
      this.x+=this.vx; this.y+=this.vy;
    }
    const pad=CONFIG.world.padding; this.x=clamp(this.x,pad,CONFIG.world.w-pad); this.y=clamp(this.y,pad,CONFIG.world.h-pad);
  }
  draw(){ const base=PALETTE.npcClothes[this.ci%PALETTE.npcClothes.length]; const hair=this.hair||this.look.hair; const step=Math.sin(this.walkPhase);
    drawPerson(this.x,this.y,base,this.face,hair,step,false); }
}

class NPC{
  constructor(x,y,cl,look){ this.x=x; this.y=y; this.vx=rand(-.4,.4); this.vy=rand(-.4,.4); this.cl=cl; this.look=look; this.phase=Math.random()*Math.PI*2; }
  update(dt){ this.phase+=dt*6; if(Math.random()<0.02){ this.vx=rand(-.5,.5); this.vy=rand(-.5,.5); }
    this.x+=this.vx; this.y+=this.vy; const pad=CONFIG.world.padding; this.x=clamp(this.x,pad,CONFIG.world.w-pad); this.y=clamp(this.y,pad,CONFIG.world.h-pad); }
  draw(){ const step=Math.sin(this.phase); drawPerson(this.x,this.y,this.cl,'meh',this.look.hair,step,Math.random()<.2); }
}

class Animal{
  constructor(x,y,kind){ this.x=x; this.y=y; this.kind=kind; this.vx=rand(-.3,.3); this.vy=rand(-.3,.3); this.t=0; }
  update(dt){ this.t+=dt; if(Math.random()<0.02){ this.vx=rand(-.3,.3); this.vy=rand(-.3,.3); }
    this.x+=this.vx; this.y+=this.vy; const pad=CONFIG.world.padding; this.x=clamp(this.x,pad,CONFIG.world.w-pad); this.y=clamp(this.y,pad,CONFIG.world.h-pad); }
  draw(){ ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(this.x,this.y+6,10,4,0,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.fillStyle= this.kind==='cat' ? '#d9d0c7' : (this.kind==='dog' ? '#caa383' : '#cfd7e1');
    if(this.kind==='pigeon'){ ctx.beginPath(); ctx.arc(this.x,this.y,6,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#9aa8b5'; ctx.fillRect(this.x-4,this.y+4,8,5); }
    else { ctx.beginPath(); ctx.ellipse(this.x,this.y,8,6,0,0,Math.PI*2); ctx.fill(); ctx.fillRect(this.x-1,this.y-8,2,6); }
    ctx.restore(); }
}

// ====== レイアウト ======
function layoutWorld(){
  genCity();
  stations = stationPoints.map(s=>new Station(s.x,s.y,s.type));
  inspirations.length=0; residents.length=0; npcs.length=0; animals.length=0; pulses.length=0; floaters.length=0; held=null;

  for(let i=0;i<32;i++){
    const b=pick(buildings);
    const px=clamp(b.x+b.w/2+rand(-60,60),CONFIG.world.padding,CONFIG.world.w-CONFIG.world.padding);
    const py=clamp(b.y+b.h/2+rand(-60,60),CONFIG.world.padding,CONFIG.world.h-CONFIG.world.padding);
    const it=pick(ITEMS);
    inspirations.push(new Inspiration(px,py,it.id));
  }
  const hairStyles=['short','long','ponytail'], hairColors=['#222','#6b3a1e','#1e3b6b','#6b1e4f','#2e6b2e'];
  for(let i=0;i<10;i++){
    const need=NEEDS[i%NEEDS.length].id;
    const look={hair:{style:pick(hairStyles), color:pick(hairColors)}};
    const bx=pick(buildings); residents.push(new Resident(bx.x+bx.w/2,bx.y+bx.h/2,i,need,look));
  }
  for(let i=0;i<28;i++){ const look={hair:{style:pick(hairStyles), color:pick(hairColors)}}; const bx=pick(buildings); npcs.push(new NPC(bx.x+bx.w/2,bx.y+bx.h/2,pick(PALETTE.npcClothes),look)); }
  for(let i=0;i<16;i++){ const bx=pick(buildings); animals.push(new Animal(bx.x+bx.w/2,bx.y+bx.h/2,pick(['cat','dog','pigeon']))); }

  const vs=viewSizeWorld(); cam.x=(CONFIG.world.w-vs.w)/2; cam.y=(CONFIG.world.h-vs.h)/2; cam.z=0.6;
}
