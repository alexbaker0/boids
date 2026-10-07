// Same idea as the 2D grid, extended to a third axis.
export class SpatialGrid3D {
  constructor(cellSize) {
    this.cellSize = Math.max(cellSize, 1);
    this.cells = new Map();
  }

  key(cx, cy, cz) {
    return `${cx},${cy},${cz}`;
  }

  cellCoords(pos) {
    return [Math.floor(pos.x / this.cellSize), Math.floor(pos.y / this.cellSize), Math.floor(pos.z / this.cellSize)];
  }

  build(boids) {
    this.cells.clear();
    for (const boid of boids) {
      const [cx, cy, cz] = this.cellCoords(boid.position);
      const k = this.key(cx, cy, cz);
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
    const [cx, cy, cz] = this.cellCoords(pos);
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        for (let dz = -range; dz <= range; dz++) {
          const bucket = this.cells.get(this.key(cx + dx, cy + dy, cz + dz));
          if (bucket) result.push(...bucket);
        }
      }
    }
    return result;
  }
}
