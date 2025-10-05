<template>
  <div class="asteroid-impact">
    <canvas ref="canvas" class="webgl"></canvas>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'landing' });
useSeoMeta({ title: 'Meteor Impact Simulation' });

import { onMounted, onBeforeUnmount, ref, reactive } from "vue";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import meteor_texture from "~/assets/textures/meteor.png";

const canvas = ref(null);
let renderer, scene, camera, earth, asteroid, animationId;
let explosions = [];
let shakePower = 0;
let pulseTime = 0;
let impactHappened = false;
let impactMarker = null;
let cameraTarget = new THREE.Vector3(0, 0, 6);

// ---------- Asteroid creation ----------
function createAsteroidMesh() {
  const geom = mergeVertices(new THREE.IcosahedronGeometry(0.3, 4));
  const posAttr = geom.attributes.position;
  const orig = new Float32Array(posAttr.array);

  for (let i = 0; i < posAttr.count; i++) {
    const x = orig[i * 3];
    const y = orig[i * 3 + 1];
    const z = orig[i * 3 + 2];
    const scale = 1 + (Math.random() - 0.5) * 0.1;
    posAttr.setXYZ(i, x * scale, y * scale, z * scale);
  }
  geom.computeVertexNormals();

  const tex = new THREE.TextureLoader().load(meteor_texture);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.9,
    metalness: 0.1,
  });
  return new THREE.Mesh(geom, mat);
}

// ---------- Explosion ----------
function createExplosion(pos, color = 0xff8888) {
  const count = 50;
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const velocities = [];

  for (let i = 0; i < count; i++) {
    positions.push(pos.x, pos.y, pos.z);
    const dir = new THREE.Vector3(
      (Math.random() - 0.5),
      (Math.random() - 0.5),
      (Math.random() - 0.5)
    ).normalize();
    velocities.push(dir.x * (0.05 + Math.random() * 0.1));
    velocities.push(dir.y * (0.05 + Math.random() * 0.1));
    velocities.push(dir.z * (0.05 + Math.random() * 0.1));
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("velocity", new THREE.Float32BufferAttribute(velocities, 3));

  const mat = new THREE.PointsMaterial({
    color,
    size: 0.15,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geo, mat);
  particles.userData.life = 1.0;
  scene.add(particles);
  explosions.push(particles);
}

// ---------- Convert lat/lon to 3D vector ----------
function latLonToVector3(lat, lon, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// ---------- Scene setup ----------
onMounted(() => {
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.copy(cameraTarget);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(5, 6, 5);
  scene.add(ambient, dir);

  // Earth
  const earthGeo = new THREE.SphereGeometry(2, 64, 64);
  const earthMat = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"),
    roughness: 0.4,
  });
  earth = new THREE.Mesh(earthGeo, earthMat);
  scene.add(earth);

  // Asteroid
  asteroid = createAsteroidMesh();
  asteroid.visible = false;
  scene.add(asteroid);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 1500; i++) {
    starPos.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 }));
  scene.add(stars);

  const clock = new THREE.Clock();

  // ---------- Animate ----------
  function animate() {
    animationId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    // Asteroid movement
    if (asteroid.visible) {
      asteroid.position.addScaledVector(asteroid.userData.velocity, dt * 60);
      asteroid.rotation.x += 0.01;
      asteroid.rotation.y += 0.015;

      // Move camera smoothly towards the asteroid impact point
      camera.position.lerp(new THREE.Vector3().copy(asteroid.position).normalize().multiplyScalar(5), 0.02);
      camera.lookAt(earth.position);
    }

    // Check collision
    if (asteroid.visible && asteroid.position.distanceTo(earth.position) < 2.05) {
      createExplosion(asteroid.position.clone(), 0xff8888);
      shakePower = 0.15;
      asteroid.visible = false;
      impactHappened = true;
      pulseTime = 0;
      

      // Criar um círculo vermelho no ponto de impacto
      const markerGeo = new THREE.CircleGeometry(0.25, 32);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xff8888, transparent: true, opacity: 0.8 });
      impactMarker = new THREE.Mesh(markerGeo, markerMat);
      impactMarker.position.copy(asteroid.position.clone().normalize().multiplyScalar(2.01));
      impactMarker.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(impactMarker);
    }

    // Explosion particles
    explosions.forEach((p, idx) => {
      const positions = p.geometry.attributes.position;
      const velocities = p.geometry.attributes.velocity;
      for (let j = 0; j < positions.count; j++) {
        positions.array[j * 3] += velocities.array[j * 3] * dt * 60;
        positions.array[j * 3 + 1] += velocities.array[j * 3 + 1] * dt * 60;
        positions.array[j * 3 + 2] += velocities.array[j * 3 + 2] * dt * 60;
      }
      positions.needsUpdate = true;
      p.userData.life -= dt * 2;
      p.material.opacity = Math.max(p.userData.life / 1, 0);
      if (p.userData.life <= 0) {
        scene.remove(p);
        explosions.splice(idx, 1);
      }
    });

    // Camera shake
    if (shakePower > 0.001) {
      const shakeX = (Math.random() - 0.5) * shakePower;
      const shakeY = (Math.random() - 0.5) * shakePower;
      camera.position.x += shakeX;
      camera.position.y += shakeY;
      shakePower *= 0.9;
    }

    renderer.render(scene, camera);
  }

  animate();

  // ---------- Launch asteroid to a lat/lon ----------
  function launchAsteroid(lat, lon) {
    const impactPoint = latLonToVector3(lat, lon, 2);
    asteroid.position.set(impactPoint.x * 3, impactPoint.y * 3, impactPoint.z * 3); // start outside
    const direction = new THREE.Vector3().subVectors(impactPoint, asteroid.position).normalize();
    asteroid.userData.velocity = direction.multiplyScalar(0.05);
    asteroid.visible = true;
  }

  // Exemplo: lançar asteroide em coordenadas específicas
launchAsteroid(35.86166, 104.195397); // China

  // Resize handler
  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", onResize);

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
  });
});
</script>

<style scoped>
.asteroid-impact {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas.webgl {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
