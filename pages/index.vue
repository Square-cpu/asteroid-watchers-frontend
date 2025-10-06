<template>
  <div class="landing-page">
    <div class="canvas-container">
      <canvas ref="canvas" class="canvas"></canvas>
    </div>

    <div class="content-overlay">
      <h1>Asteroid</h1>
      <h1>Watchers</h1>
      <h3>
        A simulation tool that models meteors orbiting Earth, tracking their
        trajectories as they enter the atmosphere and collide with the planet.
        It visualizes impacts in real time, showing scale, location, and effects
        of each collision
      </h3>
      <NuxtLink to="/simulation">
        <button class="btn">Start Simulation</button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "landing" });
useSeoMeta({ title: "Meteor" });

import { onMounted, onBeforeUnmount, ref } from "vue";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import meteor_texture from "~/assets/textures/meteor.png";

const canvas = ref(null);
let renderer, leftScene, rightScene, leftCamera, rightCamera;
let asteroidMeshes = [];
let animationId;

function makeNoiseGenerator(seed) {
  return (x, y, z) => Math.random() * 2 - 1;
}

function generateCratersForAsteroid(params) {
  const craters = [];
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
  return craters;
}

function deformGeometryWithNoise(geometry, origPositions, params) {
  const positions = geometry.attributes.position.array;
  const nrm = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    tmp.set(origPositions[i], origPositions[i + 1], origPositions[i + 2]);
    nrm.copy(tmp).normalize();
    const displacement = (Math.random() * 2 - 1) * params.noiseAmp;
    positions[i] = nrm.x * (1 + displacement);
    positions[i + 1] = nrm.y * (1 + displacement);
    positions[i + 2] = nrm.z * (1 + displacement);
  }
  geometry.computeVertexNormals();
  geometry.attributes.position.needsUpdate = true;
}

// create asteroid
function createAsteroidMesh() {
  const geom = mergeVertices(new THREE.IcosahedronGeometry(1, 6));
  const posAttr = geom.attributes.position;
  const orig = new Float32Array(posAttr.array);
  const params = {
    noiseAmp: 0.1,
    craterCount: 5,
    craterRadius: 0.2,
    craterDepth: 0.05,
  };
  deformGeometryWithNoise(geom, orig, params);

  const mat = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(meteor_texture),
    metalness: 0.05,
    roughness: 0.9,
  });

  return new THREE.Mesh(geom, mat);
}

// setup the scene
onMounted(() => {
  document.body.style.overflow = "hidden";
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  renderer.autoClear = false;

  // LEFT Scene (asteroid)
  leftScene = new THREE.Scene();
  leftCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  leftCamera.position.set(0, 0, 6);
  leftScene.background = new THREE.Color(0x000000); // fundo totalmente preto

  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 10, 7);
  leftScene.add(dir);

  const asteroidPositions = [
    new THREE.Vector3(-3.5, 2.0, -0.1),
    new THREE.Vector3(-1.4, 0.5, 0.2),
    new THREE.Vector3(-3.0, -1.5, 0.1),
    new THREE.Vector3(1.9, -0.7, 0.1),
    new THREE.Vector3(0.0, 2.0, 0.2),
    new THREE.Vector3(1.5, 1.5, 0.1),
    new THREE.Vector3(0.0, -2.0, 0.2),
    new THREE.Vector3(3.0, -2.5, 0.1),
  ];

  asteroidPositions.forEach((pos) => {
    const a = createAsteroidMesh();
    const s = 0.15 + Math.random() * 0.35;
    a.scale.setScalar(s);
    a.position.copy(pos);
    a.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    a.userData.rotVel = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    );
    asteroidMeshes.push(a);
    leftScene.add(a);
  });

  // RIGHT Scene (earth + stars)
  rightScene = new THREE.Scene();
  rightCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  rightCamera.position.set(0, 0, 5);
  rightScene.background = new THREE.Color(0x000000);

  rightScene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(5, 6, 5);
  rightScene.add(keyLight);

  const earthGeo = new THREE.SphereGeometry(2.2, 64, 64);
  const earthMat = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(
      "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
    ),
    metalness: 0.02,
    roughness: 0.45,
  });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  earth.position.set(1, 0, 0);
  rightScene.add(earth);

  // stars
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1500;
  const starPositions = [];
  for (let i = 0; i < starCount; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
  }
  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
  );
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const stars = new THREE.Points(starGeo, starMat);
  rightScene.add(stars);
  leftScene.add(stars.clone());

  // resize
  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);

  // animation
  const clock = new THREE.Clock();
  function animate() {
    animationId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    const leftWidth = Math.floor(width * 0.6);
    const rightWidth = width - leftWidth;

    renderer.setScissorTest(true);
    renderer.clear();

    // LEFT
    renderer.setViewport(0, 0, leftWidth, height);
    renderer.setScissor(0, 0, leftWidth, height);
    leftCamera.aspect = leftWidth / height;
    leftCamera.updateProjectionMatrix();
    asteroidMeshes.forEach((m) => {
      m.rotation.x += m.userData.rotVel.x;
      m.rotation.y += m.userData.rotVel.y;
      m.rotation.z += m.userData.rotVel.z;
    });
    renderer.render(leftScene, leftCamera);

    // RIGHT
    renderer.setViewport(leftWidth, 0, rightWidth, height);
    renderer.setScissor(leftWidth, 0, rightWidth, height);
    rightCamera.aspect = rightWidth / height;
    rightCamera.updateProjectionMatrix();
    earth.rotation.y = elapsed * 0.15;
    renderer.render(rightScene, rightCamera);

    renderer.setScissorTest(false);
  }
  animate();

  onBeforeUnmount(() => {
    document.body.style.overflow = "";
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    asteroidMeshes.forEach((m) => {
      m.geometry.dispose();
      m.material.dispose();
    });
  });
});
</script>

<style scoped>
.landing-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 5vw 5%;
  box-sizing: border-box;
  color: white;
  text-align: left;
}

.content-overlay h1 {
  font-size: 80px;
  font-weight: 800;
  font-family: "Roboto", sans-serif;
  margin: 0;
  line-height: 0.9;
}
.content-overlay h3 {
  font-size: 20px;
  font-weight: 300;
  line-height: 1.5;
  margin-top: 10px;
  max-width: 700px;
  font-family: "Roboto", sans-serif;
}
.content-overlay button {
  background: white;
  color: black;
  padding: 10px 25px;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 10px;
  transition: transform 0.3s ease-in-out;
  margin-top: 25px;
}
.content-overlay button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}
</style>
