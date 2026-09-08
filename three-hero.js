import * as THREE from "three";

const canvas = document.getElementById("three-hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 768px)").matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: false,
  powerPreference: "high-performance"
});

renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

let viewportW = window.innerWidth;
let viewportH = window.innerHeight;

function setSize(width, height) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

setSize(viewportW, viewportH);

function createLayer(count, size, opacity, spread) {
  const positions = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * spread[0];
    const y = (Math.random() - 0.5) * spread[1];
    const z = (Math.random() - 0.5) * spread[2];
    positions[i * 3] = base[i * 3] = x;
    positions[i * 3 + 1] = base[i * 3 + 1] = y;
    positions[i * 3 + 2] = base[i * 3 + 2] = z;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.4 + Math.random() * 0.9;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size,
    transparent: true,
    opacity,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return { points, base, phases, speeds, positions };
}

const main = isMobile ? 70 : 140;
const deep = isMobile ? 170 : 420;

const mainLayer = createLayer(main, 0.09, 0.9, [22, 14, 10]);
const deepLayer = createLayer(deep, 0.05, 0.4, [30, 18, 12]);
const layers = [mainLayer, deepLayer];

const mouse = { x: 0, y: 0 };
const parallax = { x: 0, y: 0 };

window.addEventListener("pointermove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

let resizeRaf = 0;
window.addEventListener("resize", () => {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    viewportW = window.innerWidth;
    viewportH = window.innerHeight;
    setSize(viewportW, viewportH);
  });
});

const clock = new THREE.Clock();
let running = true;

function animate() {
  if (!running) return;
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const halfW = viewportW * 0.5;
  const halfH = viewportH * 0.5;

  const targetX = (mouse.x - halfW) / halfW;
  const targetY = (mouse.y - halfH) / halfH;

  parallax.x += (targetX - parallax.x) * 0.05;
  parallax.y += (targetY - parallax.y) * 0.05;

  camera.position.x = parallax.x * 1.4;
  camera.position.y = -parallax.y * 0.9;
  camera.lookAt(0, 0, 0);

  mainLayer.points.rotation.y = elapsed * 0.05;
  deepLayer.points.rotation.y = elapsed * 0.02;

  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    const array = layer.positions;
    const baseData = layer.base;
    const phasesData = layer.phases;
    const speedsData = layer.speeds;
    const count = speedsData.length;
    for (let i = 0; i < count; i++) {
      const t = elapsed * speedsData[i];
      const off = i * 3;
      array[off] = baseData[off] + Math.sin(t + phasesData[i]) * 0.25;
      array[off + 1] = baseData[off + 1] + Math.cos(t * 0.8 + phasesData[i]) * 0.25;
    }
    layer.points.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
  if (running) {
    clock.getDelta();
    animate();
  }
});

if (reducedMotion) {
  renderer.render(scene, camera);
} else {
  animate();
}