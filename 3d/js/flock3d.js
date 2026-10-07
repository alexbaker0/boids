import { Boid3D } from "./boid3d.js";
import { Obstacle3D } from "./obstacle3d.js";
import { SpatialGrid3D } from "./spatialGrid3d.js";

export class Flock3D {
  constructor(scene) {
    this.scene = scene;
    this.boids = [];
    this.obstacles = [];
    this.grid = new SpatialGrid3D(40);
  }

  setBoidCount(count, bound) {
    if (count < this.boids.length) {
      const removed = this.boids.splice(count);
      for (const boid of removed) boid.dispose(this.scene);
    } else {
      while (this.boids.length < count) {
        const x = (Math.random() * 2 - 1) * bound;
        const y = (Math.random() * 2 - 1) * bound;
        const z = (Math.random() * 2 - 1) * bound;
        this.boids.push(new Boid3D(x, y, z, this.scene));
      }
    }
  }

  addObstacle(x, y, z, radius, opts) {
    this.obstacles.push(new Obstacle3D(x, y, z, radius, this.scene, opts));
  }

  clearObstacles() {
    for (const obstacle of this.obstacles) obstacle.dispose(this.scene);
    this.obstacles.length = 0;
  }

  step(bound, params) {
    const maxRadius = Math.max(params.separationRadius, params.alignmentRadius, params.cohesionRadius);
    this.grid.cellSize = maxRadius;
    this.grid.build(this.boids);

    for (const boid of this.boids) {
      const neighbors = this.grid.queryRadius(boid.position, maxRadius);
      boid.flock(neighbors, this.obstacles, params, bound);
    }
    for (const boid of this.boids) {
      boid.update(params);
      boid.wrapEdges(bound);
      boid.show();
    }
  }
}
