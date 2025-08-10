'use strict';

let CITY_LAYER = null, CITY_SCALE = 0.4;
let CITY_W = 0, CITY_H = 0;          // レイヤ作成時のワールドサイズ
let CITY_NEEDS_REBUILD = false;      // 再生成フラグ

function buildCityLayer(){
    CITY_W = CONFIG.world.w;
    CITY_H = CONFIG.world.h;
    const W = CITY_W, H = CITY_H;

    const can = document.createElement('canvas');
    can.width = Math.max(1, Math.floor(W * CITY_SCALE));
    can.height = Math.max(1, Math.floor(H * CITY_SCALE));
    const g = can.getContext('2d');
    g.scale(CITY_SCALE, CITY_SCALE);

    // 背景色
    g.fillStyle = '#add8e6';
    g.fillRect(0, 0, W, H);

    // 建物描画
    for (let ent of ENTITIES) {
        if (ent.type === 'building') {
            g.fillStyle = ent.color || '#ff69b4';
            g.fillRect(ent.x, ent.y, ent.w, ent.h);
        }
    }

    CITY_LAYER = can;
    CITY_NEEDS_REBUILD = false;
}

function drawCityFast(){
    const need =
        !CITY_LAYER ||
        CITY_NEEDS_REBUILD ||
        CITY_W !== CONFIG.world.w || CITY_H !== CONFIG.world.h;

    if (need) buildCityLayer();

    const dw = cvs.width / DPR, dh = cvs.height / DPR;
    const vw = viewSizeWorld();
    const sx = cam.x * CITY_SCALE, sy = cam.y * CITY_SCALE;
    const sw = vw.w * CITY_SCALE,  sh = vw.h * CITY_SCALE;

    setScreen();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(CITY_LAYER, sx, sy, sw, sh, 0, 0, dw, dh);
    setWorld();
}

// イベントでレイヤ再生成フラグを立てる（即nullにしない）
addEventListener('resize', () => { CITY_NEEDS_REBUILD = true; });
