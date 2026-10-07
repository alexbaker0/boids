import { Vector2 } from "./vector.js";

export class Boid {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = Vector2.random2D().setMag(2 + Math.random() * 2);
    this.acceleration = new Vector2();
  }

  // Is `other` within `radius` and within the forward field-of-view
  // defined by `angleDeg` (360 = full circle around the boid)?
  canPerceive(other, radius, angleDeg) {
    const diff = other.position.sub(this.position);
    const dist = diff.mag();
    if (dist === 0 || dist > radius) return false;
    if (angleDeg >= 360) return true;

    const speed = this.velocity.mag();
    const heading = speed === 0 ? new Vector2(1, 0) : this.velocity.normalize();
    const cosAngle = heading.dot(diff.normalize());
    const cosThreshold = Math.cos(((angleDeg / 2) * Math.PI) / 180);
    return cosAngle >= cosThreshold;
  }

  separation(boids, params) {
    const steer = new Vector2();
    let total = 0;
    for (const other of boids) {
      if (other === this) continue;
      if (!this.canPerceive(other, params.separationRadius, params.perceptionAngle)) continue;
      const diff = this.position.sub(other.position);
      const dist = Math.max(diff.mag(), 0.0001);
      steer.add(diff.div(dist)); // weight inversely by distance
      total++;
    }
    if (total === 0 || steer.mag() === 0) return steer; // no neighbors, or they exactly cancel out
    steer.div(total);
    steer.setMag(params.maxSpeed);
    return steer.sub(this.velocity).limit(params.maxForce);
  }

  alignment(boids, params) {
    const sum = new Vector2();
    let total = 0;
    for (const other of boids) {
      if (other === this) continue;
      if (!this.canPerceive(other, params.alignmentRadius, params.perceptionAngle)) continue;
      sum.add(other.velocity);
      total++;
    }
    if (total === 0) return sum;
    sum.div(total);
    if (sum.mag() === 0) return sum; // neighbor velocities cancel out
    sum.setMag(params.maxSpeed);
    return sum.sub(this.velocity).limit(params.maxForce);
  }

  cohesion(boids, params) {
    const sum = new Vector2();
    let total = 0;
    for (const other of boids) {
      if (other === this) continue;
      if (!this.canPerceive(other, params.cohesionRadius, params.perceptionAngle)) continue;
      sum.add(other.position);
      total++;
    }
    if (total === 0) return sum;
    sum.div(total);
    const desired = sum.sub(this.position);
    if (desired.mag() === 0) return desired; // already at the flock's center
    desired.setMag(params.maxSpeed);
    return desired.sub(this.velocity).limit(params.maxForce);
  }

  avoidObstacles(obstacles, params) {
    const steer = new Vector2();
    for (const obstacle of obstacles) {
      const diff = this.position.sub(new Vector2(obstacle.x, obstacle.y));
      const edgeDist = diff.mag() - obstacle.radius;
      if (edgeDist > params.obstacleMargin) continue;
      const pushDist = Math.max(edgeDist, 1);
      steer.add(diff.normalize().div(pushDist));
    }
    if (steer.mag() === 0) return steer;
    steer.setMag(params.maxSpeed);
    return steer.sub(this.velocity).limit(params.maxForce * 3);
  }

  flock(boids, obstacles, params) {
    const sep = this.separation(boids, params).mult(params.separationWeight);
    const ali = this.alignment(boids, params).mult(params.alignmentWeight);
    const coh = this.cohesion(boids, params).mult(params.cohesionWeight);
    const avoid = this.avoidObstacles(obstacles, params).mult(params.obstacleAvoidWeight);
    this.acceleration.add(sep).add(ali).add(coh).add(avoid);
  }

  update(params) {
    this.velocity.add(this.acceleration);
    this.velocity.limit(params.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  wrapEdges(width, height) {
    if (this.position.x < 0) this.position.x = width;
    else if (this.position.x > width) this.position.x = 0;
    if (this.position.y < 0) this.position.y = height;
    else if (this.position.y > height) this.position.y = 0;
  }

  show(ctx) {
    const angle = this.velocity.heading();
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-6, 4);
    ctx.lineTo(-6, -4);
    ctx.closePath();
    ctx.fillStyle = "#e8e8e8";
    ctx.fill();
    ctx.restore();
  }
}
