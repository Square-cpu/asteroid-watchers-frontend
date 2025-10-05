<template>
  <div class="asteroid-impact">
    <canvas ref="canvas" class="webgl"></canvas>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'landing' });
useSeoMeta({ title: 'Meteor Impact Simulation' });

import { onMounted, onBeforeUnmount, ref } from "vue";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import meteor_texture from "~/assets/textures/meteor.png";

const canvas = ref(null);
let renderer, scene, camera, earth, asteroid, animationId;
let explosions = [];
let shakePower = 0;

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
function createExplosion(pos, color = 0xff5533) {
  const count = 200;
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
    velocities.push(dir.x * (0.05 + Math.random() * 0.15));
    velocities.push(dir.y * (0.05 + Math.random() * 0.15));
    velocities.push(dir.z * (0.05 + Math.random() * 0.15));
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

// ---------- Scene setup ----------
onMounted(() => {
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

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
  asteroid.position.set(-5, 0.8, 0);
  asteroid.userData.velocity = new THREE.Vector3(0.05, -0.01, 0);
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

  function animate() {
    animationId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    asteroid.position.addScaledVector(asteroid.userData.velocity, dt * 60);
    asteroid.rotation.x += 0.01;
    asteroid.rotation.y += 0.015;

    earth.rotation.y += dt * 0.15;

    // Check collision
    const dist = asteroid.position.distanceTo(earth.position);
    if (dist < 2.1) {
      createExplosion(asteroid.position, 0xff2222);
      shakePower = 0.3;
      scene.remove(asteroid);
    }

    // Shake effect
    if (shakePower > 0.001) {
      const shakeX = (Math.random() - 0.5) * shakePower;
      const shakeY = (Math.random() - 0.5) * shakePower;
      camera.position.x = shakeX;
      camera.position.y = shakeY;
      shakePower *= 0.9;
    } else {
      camera.position.set(0, 0, 6);
    }

    // Explosion particles
    explosions.forEach((p, idx) => {
      const positions = p.geometry.attributes.position;
      const velocities = p.geometry.attributes.velocity;
      for (let j = 0; j < positions.count; j++) {
        positions.array[j * 3] += velocities.array[j * 3];
        positions.array[j * 3 + 1] += velocities.array[j * 3 + 1];
        positions.array[j * 3 + 2] += velocities.array[j * 3 + 2];
      }
      positions.needsUpdate = true;
      p.userData.life -= dt;
      p.material.opacity = p.userData.life / 1.5;
      if (p.userData.life <= 0) {
        scene.remove(p);
        explosions.splice(idx, 1);
      }
    });

    renderer.render(scene, camera);
  }

  animate();

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
