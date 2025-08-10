const POP = PERF.low ? {res:6, npcs:10, animals:4} : {res:12, npcs:28, animals:12};
let entities = [];

function initEntities() {
  entities = [];
  for (let i = 0; i < POP.npcs; i++) {
    entities.push({
      x: rand(0, W),
      y: rand(0, H),
      color: choice(['#ff595e', '#8ac926', '#1982c4']),
    });
  }
}

function updateEntities() {
  for (let e of entities) {
    e.x += rand(-1, 1);
    e.y += rand(-1, 1);
  }
}

function drawEntities() {
  for (let e of entities) {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
