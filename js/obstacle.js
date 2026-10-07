export class Obstacle {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  show(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(220, 60, 60, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "rgba(220, 60, 60, 0.9)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
