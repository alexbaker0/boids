import * as THREE from "three";

const UP = new THREE.Vector3(0, 1, 0);

export class Boid3D {
  constructor(x, y, z, scene) {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize()
      .multiplyScalar(1 + Math.random());
    this.acceleration = new THREE.Vector3();

    // Cone points along +Y by default; we rotate it to face the velocity each frame.
    const geometry = new THREE.ConeGeometry(2, 7, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0xe8e8e8 });
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  canPerceive(other, radius, angleDeg) {
    const diff = other.position.clone().sub(this.position);
    const dist = diff.length();
    if (dist === 0 || dist > radius) return false;
    if (angleDeg >= 360) return true;

    const speed = this.velocity.length();
    const heading = speed === 0 ? UP : this.velocity.clone().normalize();
    const cosAngle = heading.dot(diff.normalize());
    const cosThreshold = Math.cos(((angleDeg / 2) * Math.PI) / 180);
    return cosAngle >= cosThreshold;
  }

  separation(boids, params) {
    const steer = new THREE.Vector3();
    let total = 0;
    for (const other of boids) {
      if (other === this) continue;
      if (!this.canPerceive(other, params.separationRadius, params.perceptionAngle)) continue;
      const diff = this.position.clone().sub(other.position);
      const dist = Math.max(diff.length(), 0.0001);
      steer.add(diff.divideScalar(dist));
      total++;
    }
    if (total === 0 || steer.length() === 0) return steer; // no neighbors, or they exactly cancel out
    steer.divideScalar(total);
    steer.setLength(params.maxSpeed);
    return steer.sub(this.velocity).clampLength(0, params.maxForce);
  }

  alignment(boids, params) {
    const sum = new THREE.Vector3();
    let total = 0;
    for (const other of boids) {
      if (other === this) continue;
      if (!this.canPerceive(other, params.alignmentRadius, params.perceptionAngle)) continue;
      sum.add(other.velocity);
      total++;
    }
    if (total === 0) return sum;
    sum.divideScalar(total);
    if (sum.length() === 0) return sum; // neighbor velocities cancel out
    sum.setLength(params.maxSpeed);
    return sum.sub(this.velocity).clampLength(0, params.maxForce);
  }

  cohesion(boids, params) {
    const sum = new THREE.Vector3();
    let total = 0;
    for (const other of boids) {
      if (other === this) continue;
      if (!this.canPerceive(other, params.cohesionRadius, params.perceptionAngle)) continue;
      sum.add(other.position);
      total++;
    }
    if (total === 0) return sum;
    sum.divideScalar(total);
    const desired = sum.sub(this.position);
    if (desired.length() === 0) return desired; // already at the flock's center
    desired.setLength(params.maxSpeed);
    return desired.sub(this.velocity).clampLength(0, params.maxForce);
  }

  avoidObstacles(obstacles, params) {
    const steer = new THREE.Vector3();
    for (const obstacle of obstacles) {
      if (obstacle.type === "cylinder") {
        const top = obstacle.y + obstacle.height;
        if (this.position.y > top) continue; // boid is above the cylinder, free to fly over it
        const dx = this.position.x - obstacle.x;
        const dz = this.position.z - obstacle.z;
        const horizDist = Math.sqrt(dx * dx + dz * dz);
        const edgeDist = horizDist - obstacle.radius;
        if (edgeDist > params.obstacleMargin) continue;
        const pushDist = Math.max(edgeDist, 1);
        const dir = new THREE.Vector3(dx, 0, dz).normalize();
        steer.add(dir.divideScalar(pushDist));
      } else {
        const diff = this.position.clone().sub(new THREE.Vector3(obstacle.x, obstacle.y, obstacle.z));
        const edgeDist = diff.length() - obstacle.radius;
        if (edgeDist > params.obstacleMargin) continue;
        const pushDist = Math.max(edgeDist, 1);
        steer.add(diff.normalize().divideScalar(pushDist));
      }
    }
    if (steer.lengthSq() === 0) return steer;
    steer.setLength(params.maxSpeed);
    return steer.sub(this.velocity).clampLength(0, params.maxForce * 3);
  }

  // Steers upward as the boid nears the ground plane at y = -bound, so it
  // banks away before the hard floor clamp in wrapEdges ever has to act.
  // The correction eases in with distance (instead of snapping straight to
  // full strength at the margin boundary) so it reads as a gradual climb
  // rather than bouncing off a hard wall.
  avoidGround(bound, params) {
    const heightAboveGround = this.position.y - -bound;
    if (heightAboveGround > params.verticalMargin) return new THREE.Vector3();
    const depth = 1 - THREE.MathUtils.clamp(heightAboveGround / params.verticalMargin, 0, 1);
    const desired = new THREE.Vector3(0, 1, 0).setLength(params.maxSpeed);
    const steer = desired.sub(this.velocity).clampLength(0, params.maxForce * 3);
    return steer.multiplyScalar(depth * depth);
  }

  // Mirror of avoidGround: steers downward as the boid nears the top of the
  // world, so altitude is softly capped instead of wrapping back to the floor.
  avoidCeiling(bound, params) {
    const heightBelowCeiling = bound - this.position.y;
    if (heightBelowCeiling > params.verticalMargin) return new THREE.Vector3();
    const depth = 1 - THREE.MathUtils.clamp(heightBelowCeiling / params.verticalMargin, 0, 1);
    const desired = new THREE.Vector3(0, -1, 0).setLength(params.maxSpeed);
    const steer = desired.sub(this.velocity).clampLength(0, params.maxForce * 3);
    return steer.multiplyScalar(depth * depth);
  }

  flock(boids, obstacles, params, bound) {
    const sep = this.separation(boids, params).multiplyScalar(params.separationWeight);
    const ali = this.alignment(boids, params).multiplyScalar(params.alignmentWeight);
    const coh = this.cohesion(boids, params).multiplyScalar(params.cohesionWeight);
    const avoid = this.avoidObstacles(obstacles, params).multiplyScalar(params.obstacleAvoidWeight);
    const avoidGround = this.avoidGround(bound, params).multiplyScalar(params.verticalAvoidWeight);
    const avoidCeiling = this.avoidCeiling(bound, params).multiplyScalar(params.verticalAvoidWeight);
    this.acceleration.add(sep).add(ali).add(coh).add(avoid).add(avoidGround).add(avoidCeiling);
  }

  update(params) {
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, params.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0);
  }

  wrapEdges(bound) {
    for (const axis of ["x", "z"]) {
      if (this.position[axis] > bound) this.position[axis] = -bound;
      else if (this.position[axis] < -bound) this.position[axis] = bound;
    }
    // Y never wraps: the floor and the ceiling are both hard clamps (with
    // avoidGround/avoidCeiling steering boids away before they ever get
    // here), so altitude stays within [-bound, bound] at all times.
    if (this.position.y > bound) {
      this.position.y = bound;
      if (this.velocity.y > 0) this.velocity.y = 0;
    } else if (this.position.y < -bound) {
      this.position.y = -bound;
      if (this.velocity.y < 0) this.velocity.y = 0;
    }
  }

  show() {
    this.mesh.position.copy(this.position);
    if (this.velocity.lengthSq() > 0.0001) {
      const dir = this.velocity.clone().normalize();
      this.mesh.quaternion.setFromUnitVectors(UP, dir);
    }
  }

  dispose(scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
