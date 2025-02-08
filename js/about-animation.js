import * as THREE from 'three';

export function initAboutAnimation() {
    const canvas = document.querySelector('#about-animation');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const geometry = new THREE.IcosahedronGeometry(1.6, 0);
    const material = new THREE.MeshPhongMaterial({
        color: '#3498db',
        wireframe: true,
        wireframeLinewidth: 2,
        emissive: '#3498db',
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.7
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        // Smooth follow mouse
        cube.position.x += (mouseX * 2 - cube.position.x) * 0.05;
        cube.position.y += (mouseY * 2 - cube.position.y) * 0.05;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    });

    animate();
}