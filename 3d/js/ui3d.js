import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.4/dist/tweakpane.min.js";

export function createParams() {
  return {
    boidCount: 150,
    maxSpeed: 2.2,
    maxForce: 0.1,
    perceptionAngle: 270, // degrees; 360 = boid sees all directions

    separationRadius: 15,
    separationWeight: 1.5,

    alignmentRadius: 35,
    alignmentWeight: 1.0,

    cohesionRadius: 35,
    cohesionWeight: 1.0,

    obstacleAvoidWeight: 2.0,
    obstacleMargin: 15,
    newObstacleShape: "sphere", // "sphere" | "cylinder"
    newObstacleRadius: 20,
    newCylinderHeight: 120,

    verticalAvoidWeight: 2.5,
    verticalMargin: 25,
  };
}

export function setupUI(params, stats, { onBoidCountChange, onClearObstacles }) {
  const pane = new Pane({ title: "Boids 3D Controls" });

  pane.addBinding(stats, "fps", { readonly: true, view: "graph", min: 0, max: 120 });

  const flockFolder = pane.addFolder({ title: "Flock" });
  flockFolder
    .addBinding(params, "boidCount", { min: 1, max: 800, step: 1 })
    .on("change", (ev) => onBoidCountChange(ev.value));
  flockFolder.addBinding(params, "maxSpeed", { min: 0.2, max: 6, step: 0.1 });
  flockFolder.addBinding(params, "maxForce", { min: 0.01, max: 0.5, step: 0.01 });
  flockFolder.addBinding(params, "perceptionAngle", { min: 30, max: 360, step: 5 });

  const sepFolder = pane.addFolder({ title: "Separation" });
  sepFolder.addBinding(params, "separationRadius", { min: 2, max: 80, step: 1 });
  sepFolder.addBinding(params, "separationWeight", { min: 0, max: 5, step: 0.1 });

  const aliFolder = pane.addFolder({ title: "Alignment" });
  aliFolder.addBinding(params, "alignmentRadius", { min: 2, max: 120, step: 1 });
  aliFolder.addBinding(params, "alignmentWeight", { min: 0, max: 5, step: 0.1 });

  const cohFolder = pane.addFolder({ title: "Cohesion" });
  cohFolder.addBinding(params, "cohesionRadius", { min: 2, max: 120, step: 1 });
  cohFolder.addBinding(params, "cohesionWeight", { min: 0, max: 5, step: 0.1 });

  const obsFolder = pane.addFolder({ title: "Obstacles (click ground to place)" });
  obsFolder.addBinding(params, "newObstacleShape", {
    options: { Sphere: "sphere", Cylinder: "cylinder" },
  });
  obsFolder.addBinding(params, "newObstacleRadius", { min: 2, max: 60, step: 1 });
  obsFolder.addBinding(params, "newCylinderHeight", { min: 10, max: 300, step: 5 });
  obsFolder.addBinding(params, "obstacleAvoidWeight", { min: 0, max: 10, step: 0.1 });
  obsFolder.addBinding(params, "obstacleMargin", { min: 0, max: 60, step: 1 });
  obsFolder.addButton({ title: "Clear Obstacles" }).on("click", onClearObstacles);

  const verticalFolder = pane.addFolder({ title: "Vertical Bounds (floor & ceiling)" });
  verticalFolder.addBinding(params, "verticalAvoidWeight", { min: 0, max: 10, step: 0.1 });
  verticalFolder.addBinding(params, "verticalMargin", { min: 0, max: 80, step: 1 });

  return pane;
}
