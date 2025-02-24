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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);
    
    // Create node positions using icosahedron vertices for even distribution
    const baseGeometry = new THREE.IcosahedronGeometry(1.7, 0);
    const nodePositions = baseGeometry.attributes.position.array;
    const nodeCount = nodePositions.length / 3;
    
    // Create nodes (vertices)
    const nodeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const nodeMaterial = new THREE.MeshPhysicalMaterial({
        color: '#4a9eff',
        emissive: '#4a9eff',
        emissiveIntensity: 0.6,
        metalness: 0.2,
        roughness: 0.2,
        reflectivity: 1.0
    });
    
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        const i3 = i * 3;
        node.position.set(
            nodePositions[i3],
            nodePositions[i3 + 1],
            nodePositions[i3 + 2]
        );
        
        // Store original position for animation
        node.userData.originalPosition = node.position.clone();
        node.userData.velocity = new THREE.Vector3(
            Math.random() * 0.002 - 0.001,
            Math.random() * 0.002 - 0.001,
            Math.random() * 0.002 - 0.001
        );
        
        group.add(node);
        nodes.push(node);
    }
    
    // Create edges (connections between vertices)
    const edgeConnections = [];
    const edgeGroup = new THREE.Group();
    group.add(edgeGroup);
    
    // Calculate distance threshold for connections
    const connectionThreshold =1.8; // Adjust to control edge density
    
    // Create connections between nodes that are close enough
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const distance = nodes[i].position.distanceTo(nodes[j].position);
            if (distance < connectionThreshold) {
                edgeConnections.push({
                    source: i,
                    target: j,
                    distance: distance
                });
            }
        }
    }
    
    // Create edge lines
    const edgeMaterial = new THREE.LineBasicMaterial({
        color: '#00cec9',
        transparent: true,
        opacity: 0.7,
    });
    
    const edges = [];
    edgeConnections.forEach(connection => {
        const lineGeometry = new THREE.BufferGeometry();
        const points = [
            nodes[connection.source].position,
            nodes[connection.target].position
        ];
        
        lineGeometry.setFromPoints(points);
        const line = new THREE.Line(lineGeometry, edgeMaterial);
        line.userData.sourceIndex = connection.source;
        line.userData.targetIndex = connection.target;
        
        edgeGroup.add(line);
        edges.push(line);
    });
    
    // Add particles around the shape for additional effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 150;
    
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = 2.1   + Math.random() * 0.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = radius * Math.cos(phi);
        
        particleSizes[i] = Math.random() * 2 + 1;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
        color: '#6c5ce7',
        size: 0.025,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    group.add(particlesMesh);

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add multiple colored point lights for dynamic feel
    const pointLight1 = new THREE.PointLight(0x4a9eff, 1.0, 10);
    pointLight1.position.set(5, 3, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x6c5ce7, 1.0, 10);
    pointLight2.position.set(-5, -3, 5);
    scene.add(pointLight2);
    
    // Add more subtle light sources
    const pointLight3 = new THREE.PointLight(0x00cec9, 0.8, 15);
    pointLight3.position.set(0, 5, -5);
    scene.add(pointLight3);

    camera.position.z = 5;

    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    const clock = new THREE.Clock();

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Complex rotation patterns
        targetRotationX = mouseX * 0.5;
        targetRotationY = mouseY * 0.5;

        // Base rotation for group
        group.rotation.x += 0.003;
        group.rotation.y += 0.005;
        
        // Interactive mouse rotation
        group.rotation.x += (targetRotationY - group.rotation.x) * 0.05;
        group.rotation.y += (targetRotationX - group.rotation.y) * 0.05;
        
        // Follow mouse for position with easing
        group.position.x += (mouseX * 1.5 - group.position.x) * 0.03;
        group.position.y += (mouseY * 1.5 - group.position.y) * 0.03;
        
        // Animate nodes
        nodes.forEach((node, index) => {
            // Gentle breathing animation for nodes
            const breathFactor = 0.05 * Math.sin(time * 0.5 + index * 0.2);
            node.scale.set(1 + breathFactor, 1 + breathFactor, 1 + breathFactor);
            
            // Apply slight movement to nodes
            const originalPos = node.userData.originalPosition;
            const velocity = node.userData.velocity;
            
            // Move nodes slightly from their original position
            node.position.x = originalPos.x + Math.sin(time * 0.8 + index) * 0.1;
            node.position.y = originalPos.y + Math.cos(time * 0.7 + index * 0.5) * 0.1;
            node.position.z = originalPos.z + Math.sin(time * 0.6 + index * 0.7) * 0.1;
        });
        
        // Update edge positions
        edges.forEach(edge => {
            const sourceNode = nodes[edge.userData.sourceIndex];
            const targetNode = nodes[edge.userData.targetIndex];
            
            const points = [
                sourceNode.position,
                targetNode.position
            ];
            
            edge.geometry.setFromPoints(points);
            edge.geometry.verticesNeedUpdate = true;
            
            // Pulse effect on edges
            const distance = sourceNode.position.distanceTo(targetNode.position);
            const pulseOpacity = Math.max(0.2, Math.min(0.8, Math.sin(time * 2 + distance) * 0.3 + 0.5));
            edge.material.opacity = pulseOpacity;
        });
        
        // Animate particles
        if (particlesMesh) {
            const positions = particlesMesh.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                // Add gentle orbital motion to particles
                positions[i3] += Math.sin(time + i * 0.1) * 0.002;
                positions[i3 + 1] += Math.cos(time + i * 0.1) * 0.002;
                positions[i3 + 2] += Math.sin(time * 0.5 + i * 0.1) * 0.002;
            }
            
            particlesMesh.geometry.attributes.position.needsUpdate = true;
        }

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