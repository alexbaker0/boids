import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.4/dist/tweakpane.min.js";

export function createParams() {
  return {
    boidCount: 150,
    maxSpeed: 4,
    maxForce: 0.2,
    perceptionAngle: 270, // degrees; 360 = boid sees all directions

    separationRadius: 25,
    separationWeight: 1.5,

    alignmentRadius: 50,
    alignmentWeight: 1.0,

    cohesionRadius: 50,
    cohesionWeight: 1.0,

    obstacleAvoidWeight: 2.0,
    obstacleMargin: 20,
    newObstacleRadius: 30,
  };
}

export function setupUI(params, stats, { onBoidCountChange, onClearObstacles }) {
  const pane = new Pane({ title: "Boids Controls" });

  pane.addBinding(stats, "fps", { readonly: true, view: "graph", min: 0, max: 120 });

  const flockFolder = pane.addFolder({ title: "Flock" });
  flockFolder
    .addBinding(params, "boidCount", { min: 1, max: 2000, step: 1 })
    .on("change", (ev) => onBoidCountChange(ev.value));
  flockFolder.addBinding(params, "maxSpeed", { min: 0.5, max: 10, step: 0.1 });
  flockFolder.addBinding(params, "maxForce", { min: 0.01, max: 1, step: 0.01 });
  flockFolder.addBinding(params, "perceptionAngle", { min: 30, max: 360, step: 5 });

  const sepFolder = pane.addFolder({ title: "Separation" });
  sepFolder.addBinding(params, "separationRadius", { min: 5, max: 150, step: 1 });
  sepFolder.addBinding(params, "separationWeight", { min: 0, max: 5, step: 0.1 });

  const aliFolder = pane.addFolder({ title: "Alignment" });
  aliFolder.addBinding(params, "alignmentRadius", { min: 5, max: 200, step: 1 });
  aliFolder.addBinding(params, "alignmentWeight", { min: 0, max: 5, step: 0.1 });

  const cohFolder = pane.addFolder({ title: "Cohesion" });
  cohFolder.addBinding(params, "cohesionRadius", { min: 5, max: 200, step: 1 });
  cohFolder.addBinding(params, "cohesionWeight", { min: 0, max: 5, step: 0.1 });

  const obsFolder = pane.addFolder({ title: "Obstacles (click canvas to place)" });
  obsFolder.addBinding(params, "newObstacleRadius", { min: 5, max: 100, step: 1 });
  obsFolder.addBinding(params, "obstacleAvoidWeight", { min: 0, max: 10, step: 0.1 });
  obsFolder.addBinding(params, "obstacleMargin", { min: 0, max: 100, step: 1 });
  obsFolder.addButton({ title: "Clear Obstacles" }).on("click", onClearObstacles);

  return pane;
}
