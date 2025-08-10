// ====== ここは先頭～既存のクラス定義はそのまま ======
// …（Resident / NPC / Animal クラス定義は変更なし）…

// ====== レイアウト ======
function layoutWorld(){
  genCity();
  stations = stationPoints.map(s=>new Station(s.x,s.y,s.type));
  inspirations.length=0; residents.length=0; npcs.length=0; animals.length=0; pulses.length=0; floaters.length=0; held=null;

  // アイテム
  for(let i=0;i<32;i++){
    const b=pick(buildings);
    const px=clamp(b.x+b.w/2+rand(-60,60),CONFIG.world.padding,CONFIG.world.w-CONFIG.world.padding);
    const py=clamp(b.y+b.h/2+rand(-60,60),CONFIG.world.padding,CONFIG.world.h-CONFIG.world.padding);
    const it=pick(ITEMS);
    inspirations.push(new Inspiration(px,py,it.id));
  }

  // 端末別のボリューム
  const POP = PERF.low ? {res:8,npcs:14,animals:6} : {res:12,npcs:40,animals:18};
  const hairStyles=['short','long','ponytail'], hairColors=['#222','#6b3a1e','#1e3b6b','#6b1e4f','#2e6b2e'];

  for(let i=0;i<POP.res;i++){
    const need=NEEDS[i%NEEDS.length].id;
    const look={hair:{style:pick(hairStyles), color:pick(hairColors)}};
    const bx=pick(buildings); residents.push(new Resident(bx.x+bx.w/2,bx.y+bx.h/2,i,need,look));
  }
  for(let i=0;i<POP.npcs;i++){ const look={hair:{style:pick(hairStyles), color:pick(hairColors)}}; const bx=pick(buildings); npcs.push(new NPC(bx.x+bx.w/2,bx.y+bx.h/2,pick(PALETTE.npcClothes),look)); }
  for(let i=0;i<POP.animals;i++){ const bx=pick(buildings); animals.push(new Animal(bx.x+bx.w/2,bx.y+bx.h/2,pick(['cat','dog','pigeon']))); }

  // 静的レイヤを構築
  buildCityLayer();

  // カメラ中央
  const vs=viewSizeWorld(); cam.x=(CONFIG.world.w-vs.w)/2; cam.y=(CONFIG.world.h-vs.h)/2; cam.z=0.6;

  // スマホではヘルプを初回閉じる
  try{ if(PERF.low) document.getElementById('legendWrap').open=false; }catch(e){}
}
