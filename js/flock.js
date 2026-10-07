import { Boid } from "./boid.js";
import { Obstacle } from "./obstacle.js";
import { SpatialGrid } from "./spatialGrid.js";

export class Flock {
  constructor() {
    this.boids = [];
    this.obstacles = [];
    this.grid = new SpatialGrid(50);
  }

  setBoidCount(count, width, height) {
    if (count < this.boids.length) {
      this.boids.length = count;
    } else {
      while (this.boids.length < count) {
        this.boids.push(new Boid(Math.random() * width, Math.random() * height));
      }
    }
  }

  addObstacle(x, y, radius) {
    this.obstacles.push(new Obstacle(x, y, radius));
  }

  clearObstacles() {
    this.obstacles.length = 0;
  }

  step(ctx, width, height, params) {
    for (const obstacle of this.obstacles) obstacle.show(ctx);

    const maxRadius = Math.max(params.separationRadius, params.alignmentRadius, params.cohesionRadius);
    this.grid.cellSize = maxRadius;
    this.grid.build(this.boids);

    for (const boid of this.boids) {
      const neighbors = this.grid.queryRadius(boid.position, maxRadius);
      boid.flock(neighbors, this.obstacles, params);
    }
    for (const boid of this.boids) {
      boid.update(params);
      boid.wrapEdges(width, height);
      boid.show(ctx);
    }
  }
}
