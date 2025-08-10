// ====== 基本設定・ユーティリティ ======
const PERF = {
  low: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
};
const DPR = 1; // 固定で負荷軽減
const W = 800, H = 600;
let canvas, ctx;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function irand(min, max) {
  return Math.floor(rand(min, max));
}
function choice(arr) {
  return arr[irand(0, arr.length)];
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function setScreen() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function setWorld() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
