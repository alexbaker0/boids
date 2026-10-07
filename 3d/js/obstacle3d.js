import * as THREE from "three";

export class Obstacle3D {
  // For a cylinder, `y` is the base (it stands on the floor) and `height`
  // is required; for a sphere, `y` is its center and height is unused.
  constructor(x, y, z, radius, scene, { type = "sphere", height = 0 } = {}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = radius;
    this.type = type;
    this.height = height;

    if (type === "cylinder") {
      const geometry = new THREE.CylinderGeometry(radius, radius, height, 20);
      const material = new THREE.MeshStandardMaterial({
        color: 0xd7943c,
        transparent: true,
        opacity: 0.55,
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(x, y + height / 2, z);
    } else {
      const geometry = new THREE.SphereGeometry(radius, 24, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0xdc3c3c,
        transparent: true,
        opacity: 0.35,
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(x, y, z);
    }
    scene.add(this.mesh);
  }

  dispose(scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
