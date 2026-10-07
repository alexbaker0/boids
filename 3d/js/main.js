import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Flock3D } from "./flock3d.js";
import { createParams, setupUI } from "./ui3d.js";

const BOUND = 200;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111318);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(BOUND * 1.8, BOUND * 1.1, BOUND * 1.8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(1, 1.5, 1);
scene.add(dirLight);

const boundsGeometry = new THREE.BoxGeometry(BOUND * 2, BOUND * 2, BOUND * 2);
const boundsEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(boundsGeometry),
  new THREE.LineBasicMaterial({ color: 0x444a55 })
);
scene.add(boundsEdges);

// Solid floor at the bottom of the cube (y = -BOUND) that boids collide with.
// Semi-transparent so boids are still visible if the camera dips below it.
const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(BOUND * 2, BOUND * 2),
  new THREE.MeshStandardMaterial({
    color: 0x2e8b47,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -BOUND;
scene.add(groundMesh);

const groundGrid = new THREE.GridHelper(BOUND * 2, 20, 0x5a6070, 0x3a3f4a);
groundGrid.position.y = -BOUND + 0.5;
scene.add(groundGrid);

const params = createParams();
const stats = { fps: 0 };
const flock = new Flock3D(scene);
flock.setBoidCount(params.boidCount, BOUND);

setupUI(params, stats, {
  onBoidCountChange: (count) => flock.setBoidCount(count, BOUND),
  onClearObstacles: () => flock.clearObstacles(),
});

// Obstacles are placed by raycasting the click onto the y=0 ground plane.
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const pointer = new THREE.Vector2();
const groundHit = new THREE.Vector3();

function raycastGround(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (!raycaster.ray.intersectPlane(groundPlane, groundHit)) return null;
  return {
    x: THREE.MathUtils.clamp(groundHit.x, -BOUND, BOUND),
    z: THREE.MathUtils.clamp(groundHit.z, -BOUND, BOUND),
  };
}

renderer.domElement.addEventListener("click", (e) => {
  const hit = raycastGround(e);
  if (!hit) return;
  if (params.newObstacleShape === "cylinder") {
    flock.addObstacle(hit.x, -BOUND, hit.z, params.newObstacleRadius, {
      type: "cylinder",
      height: params.newCylinderHeight,
    });
  } else {
    flock.addObstacle(hit.x, 0, hit.z, params.newObstacleRadius, { type: "sphere" });
  }
});

// Ghost preview of where the next obstacle will land, following the cursor.
const previewMaterial = new THREE.MeshBasicMaterial({
  color: 0x8fd9ff,
  transparent: true,
  opacity: 0.3,
  depthWrite: false,
});
const previewSphere = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), previewMaterial);
const previewCylinder = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 20), previewMaterial.clone());
previewSphere.visible = false;
previewCylinder.visible = false;
scene.add(previewSphere, previewCylinder);

let previewHit = null;
let previewRadius = -1;
let previewHeight = -1;

renderer.domElement.addEventListener("pointermove", (e) => {
  previewHit = raycastGround(e);
});
renderer.domElement.addEventListener("pointerleave", () => {
  previewHit = null;
});

function updatePreview() {
  // Rebuild geometry only when the radius/height sliders actually changed.
  if (params.newObstacleRadius !== previewRadius || params.newCylinderHeight !== previewHeight) {
    previewRadius = params.newObstacleRadius;
    previewHeight = params.newCylinderHeight;
    previewSphere.geometry.dispose();
    previewSphere.geometry = new THREE.SphereGeometry(previewRadius, 20, 14);
    previewCylinder.geometry.dispose();
    previewCylinder.geometry = new THREE.CylinderGeometry(previewRadius, previewRadius, previewHeight, 20);
  }

  const showSphere = !!previewHit && params.newObstacleShape === "sphere";
  const showCylinder = !!previewHit && params.newObstacleShape === "cylinder";
  previewSphere.visible = showSphere;
  previewCylinder.visible = showCylinder;
  if (showSphere) previewSphere.position.set(previewHit.x, 0, previewHit.z);
  if (showCylinder) previewCylinder.position.set(previewHit.x, -BOUND + previewHeight / 2, previewHit.z);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastTime = performance.now();
function animate(now) {
  const dt = now - lastTime;
  lastTime = now;
  stats.fps = dt > 0 ? 1000 / dt : 0;

  flock.step(BOUND, params);
  updatePreview();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
