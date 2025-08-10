// ===== main.js (full replace) =====
'use strict';

// --- デバッグHUD（常時表示して生存確認） ---
(function () {
  const box = document.createElement('div');
  box.style.cssText =
    'position:fixed;left:8px;bottom:8px;background:rgba(0,0,0,.6);color:#fff;padding:6px 8px;border-radius:8px;font:12px system-ui;z-index:9';
  box.id = 'debugHud';
  box.textContent = 'boot';
  (document.readyState === 'loading'
    ? addEventListener('DOMContentLoaded', () => document.body.appendChild(box))
    : document.body.appendChild(box));
  setInterval(() => (box.textContent = 'tick ' + Math.floor(performance.now() / 1000)), 800);
})();

// --- 起動 ---
cvs = document.getElementById('game');
ctx = cvs.getContext('2d');
resize(); // サイズ決定

// 初期カメラを中央へ
(function initCamCenter() {
  const v = viewSizeWorld();
  cam.x = (CONFIG.world.w - v.w) / 2;
  cam.y = (CONFIG.world.h - v.h) / 2;
  cam.z = 0.6;
  sanitizeCam();
})();

// スマホはヘルプを閉じてスタート
try {
  if (typeof PERF !== 'undefined' && PERF.low) {
    const lg = document.getElementById('legendWrap');
    if (lg) lg.open = false;
  }
} catch (e) {}

// --- メインループ ---
let last = performance.now();
let acc = 0;
let interval = (typeof PERF !== 'undefined' && PERF.low) ? 1000 / 30 : 1000 / 60;

function loop() {
  const now = performance.now();
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  acc += dt * 1000;

  // 更新
  sanitizeCam();
  if (typeof updateEntities === 'function') updateEntities(dt);

  // 描画（端末に応じて間引き）
  if (acc >= interval) {
    acc = 0;

    // 背景（安全呼び出し＋フォールバック）
    try {
      if (typeof drawCityFast === 'function') {
        if (typeof CITY_LAYER === 'undefined' || CITY_LAYER === null) {
          if (typeof drawCity === 'function') drawCity();
        } else {
          drawCityFast();
        }
      } else if (typeof drawCity === 'function') {
        drawCity();
      } else {
        throw new Error('drawCityFast/drawCity が見つからない');
      }
    } catch (e) {
      setScreen();
      ctx.fillStyle = '#f66';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText('DRAW ERROR: ' + e.message, 12, 18);
      setWorld();
    }

    // 動くもの
    if (typeof drawEntities === 'function') drawEntities();

    // 上部ステータス（任意）
    setScreen();
    const st = document.getElementById('status');
    if (st && !st.dataset.updated) {
      // 1度だけ「更新済」フラグを付けておく（ちらつき防止）
      st.dataset.updated = '1';
    }
  }

  requestAnimationFrame(loop);
}

// 初期オブジェクト生成（別ファイル）
if (typeof initEntities === 'function') initEntities();
loop();

// ====== 入力（ピンチ＝ズーム、1本指ドラッグ＝パン、ホイールズーム、＋/−） ======

// 画面中央を基準にズーム
function zoomAt(px, py, factor) {
  const before = screenToWorld(px, py);
  cam.z = clamp(cam.z * factor, zMin, zMax);
  const after = screenToWorld(px, py);
  cam.x += before.x - after.x;
  cam.y += before.y - after.y;
  sanitizeCam();
}

// --- タッチ ---
let fingers = new Map();
let startDist = 0,
  startZ = cam.z,
  startMid = null;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

cvs.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const o = fingers.get(t.identifier) || { x: t.clientX, y: t.clientY, dx: 0, dy: 0 };
      o.x = t.clientX;
      o.y = t.clientY;
      o.dx = 0;
      o.dy = 0;
      fingers.set(t.identifier, o);
    }
    if (fingers.size === 2) {
      const [a, b] = [...fingers.values()];
      startDist = distance(a, b);
      startZ = cam.z;
      startMid = midpoint(a, b);
    }
  },
  { passive: false }
);

cvs.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const o = fingers.get(t.identifier);
      if (!o) continue;
      o.dx = t.clientX - o.x;
      o.dy = t.clientY - o.y;
      o.x = t.clientX;
      o.y = t.clientY;
    }

    if (fingers.size === 2) {
      const [a, b] = [...fingers.values()];
      const cur = distance(a, b);
      const scale = clamp(cur / Math.max(1, startDist), 0.3, 3);
      const r = cvs.getBoundingClientRect();
      const before = screenToWorld(startMid.x - r.left, startMid.y - r.top);
      cam.z = clamp(startZ * scale, zMin, zMax);
      const after = screenToWorld(startMid.x - r.left, startMid.y - r.top);
      cam.x += before.x - after.x;
      cam.y += before.y - after.y;
    } else if (fingers.size === 1) {
      const [f] = [...fingers.values()];
      const v = viewSizeWorld();
      cam.x = clamp(cam.x - f.dx / cam.z, 0, CONFIG.world.w - v.w);
      cam.y = clamp(cam.y - f.dy / cam.z, 0, CONFIG.world.h - v.h);
    }
    sanitizeCam();
  },
  { passive: false }
);

function endTouches(e) {
  for (const t of e.changedTouches) fingers.delete(t.identifier);
}
cvs.addEventListener('touchend', endTouches, { passive: true });
cvs.addEventListener('touchcancel', endTouches, { passive: true });

// --- マウス（ドラッグでパン / ホイールでズーム） ---
let dragging = false,
  lastMouse = { x: 0, y: 0 };

cvs.addEventListener('mousedown', (e) => {
  dragging = true;
  lastMouse = { x: e.clientX, y: e.clientY };
});
addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const dx = (e.clientX - lastMouse.x) / cam.z;
  const dy = (e.clientY - lastMouse.y) / cam.z;
  const v = viewSizeWorld();
  cam.x = clamp(cam.x - dx, 0, CONFIG.world.w - v.w);
  cam.y = clamp(cam.y - dy, 0, CONFIG.world.h - v.h);
  lastMouse = { x: e.clientX, y: e.clientY };
});
addEventListener('mouseup', () => (dragging = false));

cvs.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    const r = cvs.getBoundingClientRect();
    const mx = e.clientX - r.left,
      my = e.clientY - r.top;
    zoomAt(mx, my, e.deltaY > 0 ? 0.9 : 1.1);
  },
  { passive: false }
);

// --- ＋ / － ボタン ---
(function () {
  const zin = document.getElementById('zin');
  const zout = document.getElementById('zout');
  if (!zin || !zout) return;
  const cx = () => cvs.width / (2 * DPR);
  const cy = () => cvs.height / (2 * DPR);
  zin.addEventListener('click', () => zoomAt(cx(), cy(), 1.15));
  zout.addEventListener('click', () => zoomAt(cx(), cy(), 0.87));
})();
