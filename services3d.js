import * as THREE from "three";

const canvas = document.getElementById("services-hero");

if (canvas && typeof WebGLRenderingContext !== "undefined" && typeof IntersectionObserver !== "undefined") {
  const bootObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        bootObserver.disconnect();
        init();
      }
    },
    { rootMargin: "300px 0px" }
  );
  bootObserver.observe(canvas);
}

function init() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  } catch (err) {
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50);
  camera.position.z = 5.2;

  const sphereCount = isMobile ? 260 : 520;
  const sphereRadius = 1.9;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const spherePositions = new Float32Array(sphereCount * 3);
  for (let i = 0; i < sphereCount; i++) {
    const y = 1 - (i / Math.max(1, sphereCount - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * golden;
    spherePositions[i * 3] = Math.cos(theta) * r * sphereRadius;
    spherePositions[i * 3 + 1] = y * sphereRadius;
    spherePositions[i * 3 + 2] = Math.sin(theta) * r * sphereRadius;
  }

  const sphereGeometry = new THREE.BufferGeometry();
  sphereGeometry.setAttribute("position", new THREE.BufferAttribute(spherePositions, 3));
  const sphereMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.055,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });
  const spherePoints = new THREE.Points(sphereGeometry, sphereMaterial);
  scene.add(spherePoints);

  const ringCount = 90;
  const ringPositions = new Float32Array(ringCount * 3);
  const ringRadius = 3.05;
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    ringPositions[i * 3] = Math.cos(angle) * ringRadius;
    ringPositions[i * 3 + 1] = Math.sin(angle) * ringRadius * 0.35;
    ringPositions[i * 3 + 2] = 0;
  }
  const ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
  const ringMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.028,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  });
  const ringPoints = new THREE.Points(ringGeometry, ringMaterial);
  ringPoints.rotation.x = Math.PI / 2.4;
  scene.add(ringPoints);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 1),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.07
    })
  );
  scene.add(core);

  let rectW = 1;
  let rectH = 1;

  function setSize() {
    const rect = canvas.getBoundingClientRect();
    rectW = Math.max(1, rect.width);
    rectH = Math.max(1, rect.height);
    camera.aspect = rectW / rectH;
    camera.updateProjectionMatrix();
    renderer.setSize(rectW, rectH, false);
  }

  setSize();

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
      setSize();
    });
  });

  let visible = true;
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  });
  observer.observe(canvas);

  const clock = new THREE.Clock();
  let running = true;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    if (!visible) return;

    const elapsed = clock.getElapsedTime();
    const halfW = rectW * 0.5;
    const halfH = rectH * 0.5;

    const targetX = (mouse.x - halfW) / halfW;
    const targetY = (mouse.y - halfH) / halfH;

    parallax.x += (targetX - parallax.x) * 0.04;
    parallax.y += (targetY - parallax.y) * 0.04;

    camera.position.x = parallax.x * 0.8;
    camera.position.y = -parallax.y * 0.5;
    camera.lookAt(0, 0, 0);

    spherePoints.rotation.y = elapsed * 0.12;
    spherePoints.rotation.x = Math.sin(elapsed * 0.05) * 0.08;
    ringPoints.rotation.z = -elapsed * 0.04;
    core.rotation.y = elapsed * 0.08;
    core.rotation.x = elapsed * 0.05;

    renderer.render(scene, camera);
  }

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      animate();
    }
  });

  window.addEventListener("load", setSize);

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    animate();
  }
}