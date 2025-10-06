<template>
  <div class="personalize-root">
    <div ref="canvasContainer" class="canvas-fill"></div>
    <div ref="uiContainer" class="ui-root" id="ui"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

import meteor_texture from "~/assets/textures/meteor.png";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "lil-gui";
import { createNoise3D } from "simplex-noise";
import alea from "alea";

const canvasContainer = ref(null);
const uiContainer = ref(null);

let scene, camera, renderer, controls, meteor, geometry, material;
let gui;
let origPositions;
let noise3D;
let rafId;
let craters = [];
let ro;

function updateNoiseWithSeed(seed) {
  const prng = alea(String(seed));
  noise3D = createNoise3D(prng);
}

function generateCraters(params) {
  craters = [];
  for (let i = 0; i < params.craterCount; i++) {
    const v = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();
    craters.push({
      center: v,
      radius: params.craterRadius * (0.6 + Math.random() * 0.8),
      depth: params.craterDepth * (0.6 + Math.random() * 0.9),
    });
  }
}

function applyDeformation(geometry, origPositions, params) {
  const positions = geometry.attributes.position.array;
  const nrm = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const scale = params.noiseScale;
  const amp = params.noiseAmp;

  for (let i = 0; i < positions.length; i += 3) {
    tmp.set(origPositions[i], origPositions[i + 1], origPositions[i + 2]);
    nrm.copy(tmp).normalize();

    const noiseVal = noise3D(nrm.x * scale, nrm.y * scale, nrm.z * scale);
    let displacement = noiseVal * amp;

    let craterEffect = 0;
    for (const c of craters) {
      const dot = nrm.dot(c.center);
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      if (angle < c.radius) {
        const t = 1 - angle / c.radius;
        craterEffect += -c.depth * (t * t);
      }
    }

    const radius = 1 + displacement + craterEffect;
    positions[i] = nrm.x * radius;
    positions[i + 1] = nrm.y * radius;
    positions[i + 2] = nrm.z * radius;
  }
  geometry.computeVertexNormals();
  geometry.attributes.position.needsUpdate = true;
}

function debounce(fn, wait = 50) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function setRendererSizeToContainer() {
  if (!canvasContainer.value || !renderer || !camera) return;

  const rect = canvasContainer.value.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  renderer.setSize(width, height, true);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

onMounted(() => {
  if (!canvasContainer.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b0b);

  camera = new THREE.PerspectiveCamera(64, 1, 0.01, 100);
  camera.position.set(0, 0, 3.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  canvasContainer.value.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 5, 5);
  scene.add(dir);

  // Texture
  const textureURL = meteor_texture;
  const loader = new THREE.TextureLoader();
  const map = loader.load(textureURL, undefined, undefined, () => {
    console.warn("Texture failed to load, check path:", textureURL);
  });

  // Geometry & material
  const detail = 6;
  geometry = new THREE.IcosahedronGeometry(1, detail);
  const positionAttr = geometry.attributes.position;
  origPositions = new Float32Array(positionAttr.array.length);
  origPositions.set(positionAttr.array);

  material = new THREE.MeshStandardMaterial({
    map,
    metalness: 0.1,
    roughness: 1.0,
    flatShading: false,
  });

  meteor = new THREE.Mesh(geometry, material);
  scene.add(meteor);

  // Params
  const defaultSeed = Math.random();
  const params = {
    noiseScale: 2.5,
    noiseAmp: 0.12,
    craterCount: 10,
    craterRadius: 0.35,
    craterDepth: 0.3,
    seed: defaultSeed,
    autoRotate: true,
    regenerateCraters() {
      generateCraters(params);
      applyDeformation(geometry, origPositions, params);
    },
    randomize() {
      params.seed = Math.random();
      updateNoiseWithSeed(params.seed);
      generateCraters(params);
      applyDeformation(geometry, origPositions, params);
      gui.updateDisplay && gui.updateDisplay();
    },
  };

  updateNoiseWithSeed(params.seed);
  generateCraters(params);
  applyDeformation(geometry, origPositions, params);

  // GUI (attach to the uiContainer element)
  gui = new GUI({ container: uiContainer.value || undefined });
  const f1 = gui.addFolder("Noise");
  f1.add(params, "noiseScale", 0.1, 10, 0.01).onChange(() =>
    applyDeformation(geometry, origPositions, params)
  );
  f1.add(params, "noiseAmp", 0, 0.6, 0.001).onChange(() =>
    applyDeformation(geometry, origPositions, params)
  );

  const f2 = gui.addFolder("Craters");
  f2.add(params, "craterCount", 0, 60, 1).onChange(() => {
    generateCraters(params);
    applyDeformation(geometry, origPositions, params);
  });
  f2.add(params, "craterRadius", 0.05, 1.2, 0.01).onChange(() => {
    generateCraters(params);
    applyDeformation(geometry, origPositions, params);
  });
  f2.add(params, "craterDepth", 0, 1, 0.01).onChange(() => {
    generateCraters(params);
    applyDeformation(geometry, origPositions, params);
  });

  const f3 = gui.addFolder("Other");
  f3.add(params, "seed").listen();
  f3.add(params, "randomize");
  f3.add(params, "autoRotate");

  // Animation loop
  function animate() {
    rafId = requestAnimationFrame(animate);
    if (params.autoRotate) meteor.rotation.y += 0.0025;
    controls.update();
    renderer.render(scene, camera);
  }

  const debouncedResize = debounce(() => setRendererSizeToContainer(), 40);

  ro = new ResizeObserver(debouncedResize);

  ro.observe(canvasContainer.value);

  const layoutGrid = document.querySelector(".layout-grid");
  if (layoutGrid) ro.observe(layoutGrid);

  const sidebarEl = document.querySelector(".sidebar");
  if (sidebarEl) ro.observe(sidebarEl);

  const onTransitionEnd = (ev) => {
    if (!ev || !ev.propertyName) {
      debouncedResize();
      return;
    }
    if (
      ev.propertyName.includes("grid-template") ||
      ev.propertyName.includes("width") ||
      ev.propertyName.includes("transform")
    ) {
      setTimeout(setRendererSizeToContainer, 0);
    }
  };
  if (layoutGrid) layoutGrid.addEventListener("transitionend", onTransitionEnd);
  if (sidebarEl) sidebarEl.addEventListener("transitionend", onTransitionEnd);

  canvasContainer.value.__three_onTransitionEnd = onTransitionEnd;
  canvasContainer.value.__three_observedEls = { layoutGrid, sidebarEl };

  setRendererSizeToContainer();
  animate();

  window.addEventListener("resize", setRendererSizeToContainer);
});

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);

  try {
    gui && gui.destroy();
  } catch (e) {}
  try {
    controls && controls.dispose();
  } catch (e) {}

  if (renderer && renderer.domElement && canvasContainer.value) {
    canvasContainer.value.removeChild(renderer.domElement);
  }

  try {
    if (geometry) geometry.dispose();
    if (material) {
      if (material.map) material.map.dispose();
      material.dispose();
    }
    if (renderer) renderer.dispose();
  } catch (e) {}

  window.removeEventListener("resize", setRendererSizeToContainer);

  if (ro) {
    ro.disconnect();
    ro = null;
  }
  if (canvasContainer.value && canvasContainer.value.__three_onTransitionEnd) {
    const { layoutGrid, sidebarEl } =
      canvasContainer.value.__three_observedEls || {};
    const h = canvasContainer.value.__three_onTransitionEnd;
    if (layoutGrid) layoutGrid.removeEventListener("transitionend", h);
    if (sidebarEl) sidebarEl.removeEventListener("transitionend", h);
    delete canvasContainer.value.__three_onTransitionEnd;
    delete canvasContainer.value.__three_observedEls;
  }
});
</script>

<style scoped>
.personalize-root {
  width: 100%;
  height: 100%;
  position: relative;
}

.canvas-fill {
  width: 100%;

  height: calc(100vh - 40px);
  position: relative;
}

.ui-root {
  position: fixed;
  right: 10px;
  top: 10px;
  z-index: 10;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>
