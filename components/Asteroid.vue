<template>
  <div class="asteroid-advanced-root">
    <div ref="canvasContainer" class="canvas-fill"></div>


    <div class="legend">
      <div><span class="color-box red"></span> Impact Radius</div>
      <div><span class="color-box blue"></span> Orbit Line</div>
    </div>
  </div>
</template>
  

<script setup>

/* AsteroidAdvanced.vue
   - Accepts a rich asteroidData payload (see README in prompt).
   - Maps many fields to visual effects without any client API calls.
*/

import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createNoise3D } from "simplex-noise";
import alea from "alea";

import meteor_texture from "~/assets/textures/meteor.png";

const props = defineProps({
  asteroidData: {
    type: Object,
    default: () => ({}),
  },

  maxVisualScale: {
    type: Number,
    default: 12,
  },
  baseScaleDivisor: {
    type: Number,
    default: 800,
  },
});

const canvasContainer = ref(null);

let scene, camera, renderer, controls;
let mesh, material, geometry, origPositions;
let orbitLine;
let impactRing;
let fragGroup;
let dangerPulseTween = null;
let rafId;
let noise3D;
let seed = Math.random();
const fragmentsVisibleRef = ref(false);
let rotationSpeed = 0.0025;


function updateNoise(s) {
  seed = s ?? Math.random();
  const prng = alea(String(seed));
  noise3D = createNoise3D(prng);
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function formatNumber(n) {
  if (n == null || isNaN(n)) return "—";
  if (n > 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n > 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n > 1e3) return (n / 1e3).toFixed(2) + "k";
  return Math.round(n);
}

function initBaseAsteroid() {
  geometry = new THREE.IcosahedronGeometry(1, 5);
  const positions = geometry.attributes.position;
  origPositions = new Float32Array(positions.array.length);
  origPositions.set(positions.array);

 
  const textureLoader = new THREE.TextureLoader();
  const meteorTex = textureLoader.load(meteor_texture);

  material = new THREE.MeshStandardMaterial({
    map: meteorTex,          
    metalness: 0.05,
    roughness: 0.9,
    flatShading: false,
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}



let craters = [];
function generateCraters(payload) {
  craters = [];
  const d = payload.diameterMeters || 200;
  const mag = payload.absolute_magnitude_h ?? payload.magnitude ?? 22;
  // base crater count proportional to diameter
  const baseCount = Math.round(clamp(d / 50, 3, 60));
  const extraFromMag = clamp((28 - mag) / 6, 0, 4);
  const count = Math.min(80, Math.round(baseCount + extraFromMag));
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    const radius = 0.04 + Math.random() * 0.6 * Math.min(1.4, d / 1200);
    const depth = 0.03 + Math.random() * 0.9 * Math.min(1, (28 - mag) / 28 + 0.2);
    craters.push({ center: v, radius, depth });
  }
}

function applyDeformation(params = {}) {
  if (!geometry || !origPositions || !noise3D) return;
  const positions = geometry.attributes.position.array;
  const tmp = new THREE.Vector3();
  const n = new THREE.Vector3();
  const noiseScale = params.noiseScale ?? 2.5;
  const noiseAmp = params.noiseAmp ?? 0.12;

  for (let i = 0; i < positions.length; i += 3) {
    tmp.set(origPositions[i], origPositions[i + 1], origPositions[i + 2]);
    n.copy(tmp).normalize();

    const noiseVal = noise3D(n.x * noiseScale, n.y * noiseScale, n.z * noiseScale);
    let displacement = noiseVal * noiseAmp;

    let craterEffect = 0;
    for (const c of craters) {
      const dot = n.dot(c.center);
      const angle = Math.acos(clamp(dot, -1, 1));
      if (angle < c.radius) {
        const t = 1 - angle / c.radius;
        craterEffect += -c.depth * (t * t);
      }
    }
    const radius = 1 + displacement + craterEffect;
    positions[i] = n.x * radius;
    positions[i + 1] = n.y * radius;
    positions[i + 2] = n.z * radius;
  }
  geometry.computeVertexNormals();
  geometry.attributes.position.needsUpdate = true;
}

// mapping payload -> visuals
function applyPayloadToVisuals(payload) {
  if (!mesh || !material || !camera) return;

  // --- scale from diameter ---
  const d = payload.diameterMeters ?? (payload.estimated_diameter_min && payload.estimated_diameter_max ? (payload.estimated_diameter_min + payload.estimated_diameter_max)/2 : 200);
  const scale = clamp(d / props.baseScaleDivisor, 0.2, props.maxVisualScale);
  mesh.scale.setScalar(scale);

  // --- elongation / lightcurve -> axis ratio ---
  const amp = payload.lightcurve_amplitude ?? 0;
  const axisRatio = 1 + clamp(amp / 1.2, 0, 1.6); // 1 .. ~2.6
  const isContactBinary = amp > 0.8;
  if (isContactBinary) {
    // create slight bilobed effect by stretching one axis and adding small second sphere visually via scale + local geometry tweak
    mesh.scale.set(axisRatio, 1, 1 / clamp(axisRatio, 1, 2.6));
  } else {
    mesh.scale.set(axisRatio, 1, 1 / clamp(axisRatio, 1, 2.0));
  }

  // --- rotation speed: prefer explicit rotation_period_hours else velocity ---
  if (payload.rotation_period_hours) {
    rotationSpeed = clamp((2 * Math.PI) / ((payload.rotation_period_hours * 3600) / 60), 0.0004, 0.08); // convert to a visually meaningful increment
  } else {
    const velKmS = payload.relative_velocity_km_s ?? (payload.relative_velocity_km_h ? payload.relative_velocity_km_h / 3600 : 0);
    rotationSpeed = clamp(0.0015 + velKmS / 12, 0.001, 0.06);
  }

  // --- camera distance: based on miss distance and scale ---
  const distKm = 1 //payload.miss_distance_km ?? payload.distanceKm ?? 1e6;
  const camZ = clamp(scale * 1.8 + distKm * 3, 1.6, 80);
  camera.position.set(0, Math.max(0.08, scale * 0.12), camZ);
  camera.updateProjectionMatrix();

  // --- material: composition, albedo, spectral_type ---
  const composition = (payload.composition || "").toLowerCase();
  const spectral = (payload.spectral_type || "").toUpperCase();
  const albedo = payload.albedo ?? (payload.albedo_estimate ?? 0.12);

  // base color mapping
  if (spectral === "S") {
    material.color = new THREE.Color(0.9, 0.78, 0.6);
    material.metalness = 0.15;
    material.roughness = clamp(1 - albedo, 0.2, 1);
  } else if (spectral === "C") {
    material.color = new THREE.Color(0.2, 0.22, 0.2);
    material.metalness = 0.02;
    material.roughness = clamp(1 - albedo + 0.2, 0.3, 1);
  } else if (composition.indexOf("metal") !== -1 || spectral === "X") {
    material.color = new THREE.Color(0.75, 0.78, 0.82);
    material.metalness = 0.7;
    material.roughness = clamp(1 - albedo * 0.9, 0.05, 0.8);
  } else if (composition.indexOf("icy") !== -1) {
    material.color = new THREE.Color(0.9, 0.94, 1.0);
    material.metalness = 0.05;
    material.roughness = clamp(1 - albedo, 0.05, 0.6);
  } else {
    material.color = new THREE.Color(0.82, 0.8, 0.74);
    material.metalness = 0.06;
    material.roughness = clamp(1 - albedo, 0.2, 1);
  }

  // emissive from absolute magnitude and impact probability (danger cue)
  const mag = payload.absolute_magnitude_h ?? payload.magnitude ?? 22;
  const magBrightness = clamp((28 - mag) / 20, 0, 1);
  const impactProb = payload.impact_probability ?? 0;
  const dangerBoost = Math.min(1, Math.sqrt(impactProb) * 25); // amplify small probs visually
  material.emissive = new THREE.Color(magBrightness * 0.35 + dangerBoost * 0.6, magBrightness * 0.18, magBrightness * 0.06);
  material.emissiveIntensity = clamp(magBrightness * 1.2 + dangerBoost, 0, 3);
  material.needsUpdate = true;

  // orbital tilt (inclination or pole)
  const inc = payload.orbital_angle ?? payload.inclination ?? payload.pole_orientation?.inclination ?? payload.orbitalInclination ?? payload.orbital_angle_deg ?? payload.orbitalAngle ?? 0;
  mesh.rotation.x = (inc * Math.PI) / 180;

  // craters + deformation
  generateCraters(payload);
  const noiseAmp = clamp(0.05 + (d / 2000), 0.02, 0.45);
  applyDeformation({ noiseScale: 2.5, noiseAmp });

  // orbit line (ellipse approximation)
  if (payload.show_orbit_line) {
    drawOrbitLine(payload.orbit_color || payload.orbitColor || "#88ccff", payload.approach_vector);
  } else {
    removeOrbitLine();
  }

  // impact ring visual (scale from impact_energy_tnt)
  if (payload.impact_energy_tnt && payload.impact_energy_tnt > 0) {
    const energy = payload.impact_energy_tnt;
    const ringScale = clamp(Math.cbrt(energy) * 0.02, 0.5, 100);
    showImpactRing(ringScale, payload.is_potentially_hazardous_asteroid || payload.impact_probability > 0);
  } else {
    hideImpactRing();
  }

  // fragments (pre-create, show/hide controlled)
  createFragments(payload, Math.round(clamp((payload.fragmentation_probability ?? 0) * 30 + (d/200), 0, 40)));
}

// orbit line helpers
function drawOrbitLine(colorHex, approachVector) {
  removeOrbitLine();
  const points = [];
  // simple circular orbit around origin in the plane oriented by approachVector if provided
  const segments = 120;
  const radius = 4; // visual radius (not physical)
  // If approachVector is provided use it to rotate the orbit plane
  const basis = new THREE.Matrix4();
  if (approachVector) {
    const v = new THREE.Vector3(approachVector.x, approachVector.y, approachVector.z).normalize();
    // rotate z-axis to v
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), v);
    basis.makeRotationFromQuaternion(quat);
  }

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0).applyMatrix4(basis);
    points.push(p);
  }
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(colorHex) });
  orbitLine = new THREE.Line(geom, mat);
  scene.add(orbitLine);
}

function removeOrbitLine() {
  if (orbitLine) {
    scene.remove(orbitLine);
    orbitLine.geometry.dispose();
    if (orbitLine.material) orbitLine.material.dispose();
    orbitLine = null;
  }
}

// impact ring visual
function showImpactRing(scale = 4, danger = false) {
  hideImpactRing();
  const geom = new THREE.RingGeometry(scale * 0.6, scale, 64);
  const mat = new THREE.MeshBasicMaterial({
    color: danger ? new THREE.Color(1.0, 0.35, 0.25) : new THREE.Color(0.6, 0.8, 1),
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
  });
  impactRing = new THREE.Mesh(geom, mat);
  impactRing.rotation.x = -Math.PI / 2;
  impactRing.position.set(0, -1.5, 0);
  scene.add(impactRing);
}

function hideImpactRing() {
  if (impactRing) {
    scene.remove(impactRing);
    try {
      impactRing.geometry.dispose();
      impactRing.material.dispose();
    } catch (e) {}
    impactRing = null;
  }
}

// fragments: create small sphere children hidden by default
function createFragments(payload, count = 8) {
  if (fragGroup) {
    // remove old
    try {
      fragGroup.children.forEach((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      scene.remove(fragGroup);
    } catch (e) {}
    fragGroup = null;
  }

  fragGroup = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const s = Math.max(0.03, Math.random() * 0.18 * Math.min(1, (payload.diameterMeters ?? 200) / 400));
    const g = new THREE.SphereGeometry(s, 6, 6);
    const m = new THREE.MeshStandardMaterial({ color: material.color.clone().multiplyScalar(0.9), roughness: material.roughness, metalness: material.metalness });
    const mmesh = new THREE.Mesh(g, m);
    mmesh.position.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8);
    fragGroup.add(mmesh);
  }
  fragGroup.visible = fragmentsVisibleRef.value;
  scene.add(fragGroup);
}

// toggles
function toggleFragments() {
  fragmentsVisibleRef.value = !fragmentsVisibleRef.value;
  if (fragGroup) fragGroup.visible = fragmentsVisibleRef.value;
}
function pulseDanger() {
  if (!material) return;
  // simple pulse by modulating emissiveIntensity
  const base = material.emissiveIntensity || 0.5;
  let t = 0;
  const dur = 1000;
  const start = performance.now();
  function step(now) {
    t = (now - start) / dur;
    material.emissiveIntensity = base + Math.sin(t * Math.PI) * 2;
    if (t < 1) requestAnimationFrame(step);
    else material.emissiveIntensity = base;
  }
  requestAnimationFrame(step);
}

let lastTime = performance.now();
const MAX_ROTATION_SPEED = 0.02; // ajuste o máximo
const rotationFactor = 140;         // ajuste a velocidade visual

function animate() {
  rafId = requestAnimationFrame(animate);

  const now = performance.now();
  let delta = (now - lastTime) / 1000; // delta em segundos
  lastTime = now;

  // aplicar limite máximo de rotação
  const effectiveRotationSpeed = Math.min(rotationSpeed, MAX_ROTATION_SPEED);

  // rotação do asteroide
  if (mesh) mesh.rotation.y += effectiveRotationSpeed * delta * rotationFactor;

  // rotação dos fragmentos
  if (fragGroup && fragmentsVisibleRef.value) {
    fragGroup.rotation.y += effectiveRotationSpeed * 0.5 * delta * rotationFactor;
  }

  // impacto ring pulsante
  if (impactRing) {
    impactRing.material.opacity = 0.12 + Math.abs(Math.sin(now / 1500)) * 0.06;
  }

  controls.update();
  renderer.render(scene, camera);
}



// sizing
function resize() {
  if (!canvasContainer.value || !renderer || !camera) return;
  const rect = canvasContainer.value.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  renderer.setSize(w, h, true);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// input->display mapping for HUD
const display = computed(() => {
  const p = props.asteroidData || {};
  return {
    name: p.label || p.name || p.id || "Asteroid",
    diameter: p.diameterMeters ? `${Math.round(p.diameterMeters)} m` : (p.estimated_diameter_min ? `${Math.round((p.estimated_diameter_min+ (p.estimated_diameter_max||p.estimated_diameter_min))/2)} m` : "—"),
    velocity: p.relative_velocity_km_s ? `${(p.relative_velocity_km_s).toFixed(2)} km/s` : (p.relative_velocity_km_h ? `${Math.round(p.relative_velocity_km_h)} km/h` : "—"),
    distance: p.miss_distance_km ? `${formatNumber(p.miss_distance_km)} km` : "—",
    magnitude: p.absolute_magnitude_h ?? p.magnitude ?? "—",
    inclination: p.orbital_angle ?? p.inclination ?? (p.pole_orientation ? `${p.pole_orientation.ra||'—'},${p.pole_orientation.dec||'—'}` : "—"),
    hazard: p.is_potentially_hazardous_asteroid ? "Yes" : "No",
    impactProb: p.impact_probability != null ? p.impact_probability : "—",
    impactEnergy: p.impact_energy_tnt ? `${formatNumber(p.impact_energy_tnt)} TNT` : "—",
    showHUD: p.showHUD !== false,
  };
});

const fragmentsVisible = fragmentsVisibleRef;

// lifecycle
onMounted(() => {
  if (!canvasContainer.value) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07070a);

  camera = new THREE.PerspectiveCamera(100, 1, 0.01, 200);
  camera.position.set(0, 0, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  canvasContainer.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x111111, 0.9);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(6, 8, 4);
  scene.add(dir);

  initBaseAsteroid();
  updateNoise(Math.random());

  // initial apply
  applyPayloadToVisuals(props.asteroidData || {});

  // events
  window.addEventListener("resize", resize);
  resize();
  animate();
});

watch(
  () => props.asteroidData,
  (nv) => {
    // Slightly change noise seed each update so deformation varies a bit.
    updateNoise(Math.random());
    applyPayloadToVisuals(nv || {});
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
  try {
    window.removeEventListener("resize", resize);
    // dispose three objects
    if (geometry) geometry.dispose();
    if (material) material.dispose();
    if (orbitLine) {
      orbitLine.geometry.dispose();
      orbitLine.material.dispose();
    }
    if (impactRing) {
      impactRing.geometry.dispose();
      impactRing.material.dispose();
    }
    if (fragGroup) {
      fragGroup.children.forEach((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
    if (renderer && canvasContainer.value && renderer.domElement) {
      canvasContainer.value.removeChild(renderer.domElement);
      renderer.dispose();
    }
  } catch (e) {}
});
</script>

<style scoped>
.asteroid-advanced-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.canvas-fill {
  width: 100%;
  height: calc(100vh - 40px);
}

/* HUD */
.hud {
  position: fixed;
  left: 1000px;
  top: 12px;
  background: rgba(6, 6, 8, 0.78);
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  z-index: 30;
  max-width: 320px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}
.hud .title {
  font-weight: 700;
  margin-bottom: 8px;
}
.hud .row {
  font-size: 13px;
  margin-bottom: 6px;
}
.hud .small {
  font-size: 12px;
  opacity: 0.85;
}
.controls {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.controls button {
  background: #111;
  color: #fff;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
}
.controls button:hover {
  border-color: #6f8cff;
}

.legend {
  position: absolute;
  top: 16px;    /* canto superior */
  left: 16px;   /* canto esquerdo */
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  z-index: 20;
}

.legend .color-box {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  vertical-align: middle;
  border-radius: 3px;
}

.legend .red {
  background-color: rgba(231, 106, 87, 0.671);
}

.legend .blue {
  background-color: #88ccff;
}
</style>
