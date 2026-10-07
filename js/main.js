import { Flock } from "./flock.js";
import { createParams, setupUI } from "./ui.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const params = createParams();
const stats = { fps: 0 };
const flock = new Flock();
flock.setBoidCount(params.boidCount, canvas.width, canvas.height);

setupUI(params, stats, {
  onBoidCountChange: (count) => flock.setBoidCount(count, canvas.width, canvas.height),
  onClearObstacles: () => flock.clearObstacles(),
});

canvas.addEventListener("click", (e) => {
  flock.addObstacle(e.clientX, e.clientY, params.newObstacleRadius);
});

let lastTime = performance.now();
function animate(now) {
  const dt = now - lastTime;
  lastTime = now;
  stats.fps = dt > 0 ? 1000 / dt : 0;

  ctx.fillStyle = "#111318";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  flock.step(ctx, canvas.width, canvas.height, params);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
