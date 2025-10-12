import { initAboutAnimation } from './about-animation.js';
import * as THREE from 'three';

const root = document.documentElement;
const getVar = (n) => getComputedStyle(root).getPropertyValue(n).trim();
const toColor = (v) => {
  const c = new THREE.Color();
  try {
    c.set(v);
  } catch {
    c.set('#fff');
  }
  return c;
};
const currentPalette = () => [
  toColor(getVar('--primary-color')),
  toColor(getVar('--secondary-color')),
  toColor(getVar('--accent-color')),
  toColor(getVar('--text-color')),
];

const canvas = document.querySelector('#animation');
const heroEl = document.querySelector('#hero');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function resizeRenderer() {
  const rect = heroEl.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
let resizeRAF = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeRAF);
  resizeRAF = requestAnimationFrame(resizeRenderer);
});
resizeRenderer();

const particleCount = 2000;
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(particleCount * 3);
const colorsAttr = new Float32Array(particleCount * 3);
const baseFade = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  const radius = Math.random() * 5;
  const theta = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(360));
  const phi = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(360));

  positions[i3] = radius * Math.sin(theta) * Math.cos(phi);
  positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
  positions[i3 + 2] = radius * Math.cos(theta);

  const y = positions[i3 + 1];
  const fade = y < -1.5 ? Math.max(0, 1 - Math.abs((y + 1.5) / 3.5)) : 1;
  baseFade[i] = fade;

  colorsAttr[i3] = colorsAttr[i3 + 1] = colorsAttr[i3 + 2] = 1;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colorsAttr, 3));

const material = new THREE.PointsMaterial({
  size: 0.008,
  vertexColors: true,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);
camera.position.z = 2;

scene.add(new THREE.AmbientLight(0x404040, 1));

function applyPalette(palette) {
  const arr = geometry.attributes.color.array;
  const L = palette.length;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const pick = palette[(i + (i % 7)) % L];
    const f = baseFade[i];
    arr[i3] = pick.r * f;
    arr[i3 + 1] = pick.g * f;
    arr[i3 + 2] = pick.b * f;
  }
  geometry.attributes.color.needsUpdate = true;

  const isLight = root.getAttribute('data-theme') === 'light';
  material.opacity = isLight ? 0.6 : 0.75;
}
applyPalette(currentPalette());

let mouseX = 0,
  mouseY = 0,
  targetX = 0,
  targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - windowHalfX) / 100;
  mouseY = (e.clientY - windowHalfY) / 100;
});
window.addEventListener('resize', () => {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
});

let scrollY = 0;
window.addEventListener(
  'scroll',
  () => {
    scrollY = window.scrollY;
  },
  { passive: true },
);

function animate() {
  requestAnimationFrame(animate);

  targetX = mouseX * 0.2;
  targetY = mouseY * 0.2;

  particles.rotation.x += 0.0005;
  particles.rotation.y += 0.0008;
  particles.rotation.y += (targetX - particles.rotation.y) * 0.01;
  particles.rotation.x += (targetY - particles.rotation.x) * 0.01;

  const scrollFactor = Math.min(1, scrollY / (window.innerHeight * 0.5));
  particles.position.y = scrollFactor * 2;
  const baseOpacity = root.getAttribute('data-theme') === 'light' ? 0.6 : 0.75;
  material.opacity = Math.max(0.2, baseOpacity * (1 - scrollFactor * 0.8));

  const pos = geometry.attributes.position.array;
  const t = performance.now() * 0.0002;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += Math.sin(t + pos[i3] * 0.5) * 0.0005;
    if (pos[i3 + 1] < -1.5) {
      pos[i3 + 1] += Math.sin(t * 2 + i * 0.1) * 0.001 * (1 + scrollFactor);
    }
  }
  geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}
animate();

new MutationObserver((muts) => {
  if (muts.some((m) => m.type === 'attributes' && m.attributeName === 'data-theme')) {
    applyPalette(currentPalette());
  }
}).observe(root, { attributes: true });

const mql = window.matchMedia('(prefers-color-scheme: light)');
mql.addEventListener?.('change', () => applyPalette(currentPalette()));

function animateStats() {
  document.querySelectorAll('.stat-number').forEach((stat) => {
    const target = parseInt(stat.getAttribute('data-target'), 10) || 0;
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    (function tick() {
      current += step;
      stat.textContent = current < target ? Math.floor(current) : target;
      if (current < target) requestAnimationFrame(tick);
    })();
  });
}
const statsContainer = document.querySelector('.stats-container');
if (statsContainer) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateStats();
        io.unobserve(e.target);
      }
    });
  });
  io.observe(statsContainer);
}

document.addEventListener('DOMContentLoaded', initAboutAnimation);
