import { initAboutAnimation } from './about-animation.js';
import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {
    initAboutAnimation();
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#animation'),
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create a color palette
const colors = [
    new THREE.Color(0x4a9eff), // Primary
    new THREE.Color(0x6c5ce7), // Secondary
    new THREE.Color(0x00cec9), // Accent
    new THREE.Color(0xffffff)  // White
];

const particles = new THREE.BufferGeometry();
const particleCount = 2000;

const posArray = new Float32Array(particleCount * 3);
const colorArray = new Float32Array(particleCount * 3);

// Advanced distribution for more interesting shape
for(let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Create a more interesting distribution with clusters
    const radius = Math.random() * 5;
    const theta = THREE.MathUtils.randFloatSpread(360); 
    const phi = THREE.MathUtils.randFloatSpread(360);
    
    posArray[i3] = radius * Math.sin(theta) * Math.cos(phi);
    posArray[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    posArray[i3 + 2] = radius * Math.cos(theta);
    
    // Assign random colors from palette
    const color = colors[Math.floor(Math.random() * colors.length)];
    colorArray[i3] = color.r;
    colorArray[i3 + 1] = color.g;
    colorArray[i3 + 2] = color.b;
}

particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

const material = new THREE.PointsMaterial({
    size: 0.008,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
});

const particleMesh = new THREE.Points(particles, material);
scene.add(particleMesh);

camera.position.z = 2;

// Add subtle background lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

// Mouse movement effect
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Create particle density gradient for smoother transition
function updateParticleDensity() {
    const positions = particleMesh.geometry.attributes.position.array;
    const colors = particleMesh.geometry.attributes.color.array;
    
    for(let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const y = positions[i3 + 1];
        
        // Create density gradient - particles fade out as they get lower
        let opacity = 1.0;
        
        // Bottom fade-out effect (y ranges roughly from -5 to 5)
        if (y < -1.5) {
            // Gradually reduce opacity for particles in lower half
            opacity = Math.max(0, 1 - Math.abs((y + 1.5) / 3.5));
        }
        
        // Apply opacity to each particle's color alpha component
        colors[i3 + 0] *= opacity;
        colors[i3 + 1] *= opacity;
        colors[i3 + 2] *= opacity;
    }
    
    particleMesh.geometry.attributes.color.needsUpdate = true;
}

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
});

// Create initial density gradient
setTimeout(updateParticleDensity, 100);

// Add scroll effect to particles
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

function animate() {
    requestAnimationFrame(animate);
    
    // Smooth animation for mouse following
    targetX = mouseX * 0.2;
    targetY = mouseY * 0.2;
    
    particleMesh.rotation.x += 0.0005;
    particleMesh.rotation.y += 0.0008;
    
    // Gentle mouse-based movement
    particleMesh.rotation.y += (targetX - particleMesh.rotation.y) * 0.01;
    particleMesh.rotation.x += (targetY - particleMesh.rotation.x) * 0.01;
    
    // Create scroll-based fade effect
    const scrollFactor = Math.min(1, scrollY / (window.innerHeight * 0.5));
    
    // Adjust particle mesh based on scroll
    if (scrollFactor > 0) {
        // Move particles upward as user scrolls down
        particleMesh.position.y = scrollFactor * 2;
        
        // Fade particles as user scrolls
        material.opacity = Math.max(0.2, 1 - scrollFactor * 0.8);
    } else {
        particleMesh.position.y = 0;
        material.opacity = 0.7;
    }
    
    // Add subtle motion to all particles
    const positions = particleMesh.geometry.attributes.position.array;
    const time = Date.now() * 0.0002;
    
    for(let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Add gentle wave motion to each particle
        positions[i3 + 1] += Math.sin(time + positions[i3] * 0.5) * 0.0005;
        
        // Add extra vertical movement for bottom particles when scrolling
        if (positions[i3 + 1] < -1.5) {
            positions[i3 + 1] += Math.sin(time * 2 + i * 0.1) * 0.001 * (1 + scrollFactor);
        }
    }
    
    particleMesh.geometry.attributes.position.needsUpdate = true;
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Trigger stats animation when section is in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            observer.unobserve(entry.target);
        }
    });
});

observer.observe(document.querySelector('.stats-container'));