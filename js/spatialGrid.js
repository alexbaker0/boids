// Uniform grid for fast "boids within radius" queries.
// Cell size is chosen per-frame to match the largest active perception
// radius, so a query only ever needs to look at the boid's own cell plus
// its 8 neighbors (a 3x3 block) instead of scanning every boid.
export class SpatialGrid {
  constructor(cellSize) {
    this.cellSize = Math.max(cellSize, 1);
    this.cells = new Map();
  }

  key(cx, cy) {
    return `${cx},${cy}`;
  }

  cellCoords(pos) {
    return [Math.floor(pos.x / this.cellSize), Math.floor(pos.y / this.cellSize)];
  }

  build(boids) {
    this.cells.clear();
    for (const boid of boids) {
      const [cx, cy] = this.cellCoords(boid.position);
      const k = this.key(cx, cy);
      let bucket = this.cells.get(k);
      if (!bucket) {
        bucket = [];
        this.cells.set(k, bucket);
      }
      bucket.push(boid);
    }
  }

  queryRadius(pos, radius) {
    const result = [];
    const range = Math.max(1, Math.ceil(radius / this.cellSize));
    const [cx, cy] = this.cellCoords(pos);
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const bucket = this.cells.get(this.key(cx + dx, cy + dy));
        if (bucket) result.push(...bucket);
      }
    }
    return result;
  }
}
