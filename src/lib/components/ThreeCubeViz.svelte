<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
  import { LED_CONFIG } from '$lib/config';
  
  export let pixels: [number, number, number][] = [];
  export let size: number = 300;
  export let showGrid: boolean = true;
  
  // Three.js objects
  let container: HTMLElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let cube: THREE.Group;
  let ledMeshes: THREE.Mesh[] = [];
  
  // Post-processing
  let composer: EffectComposer;
  let bloomPass: UnrealBloomPass;
  
  // Animation
  let animationFrameId: number;
  
  // Initialize Three.js scene
  onMount(() => {
    // Wait for next tick to ensure container is properly mounted
    setTimeout(() => {
      initScene();
      animate();
      
      // Force a resize to ensure correct dimensions
      if (container && renderer && camera) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width, height);
      }
    }, 100);
    
    // Handle window resize
    const handleResize = () => {
      if (container && renderer && camera) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Dispose resources
      if (renderer) {
        renderer.dispose();
      }
      
      if (scene) {
        scene.clear();
      }
    };
  });
  
  // Watch for changes in pixels and update LED colors
  $: if (ledMeshes.length > 0 && pixels.length > 0) {
    updateLEDColors();
  }
  
  // Watch for changes in showGrid
  $: if (cube) {
    updateGridVisibility(showGrid);
  }
  
  function initScene() {
    if (!container) return;
    
    // Get container dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Create camera
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    
    // Position camera at isometric 45-degree angle with lower zoom
    // This positions the camera to look at a corner of the cube
    const distance = 55; // Further increased distance for lower zoom
    const angleX = Math.PI / 4; // 45 degrees in X
    const angleY = Math.PI / 4; // Slight elevation angle
    camera.position.set(
      Math.cos(angleX) * distance,
      -Math.sin(angleY) * distance, // Negative Y to look from below
      Math.sin(angleX) * distance
    );
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    
    // Clear container and append canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    
    // Ensure renderer canvas fills container
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    
    // Setup post-processing
    setupPostProcessing(width, height);
    
    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 90;
    controls.maxPolarAngle = Math.PI; // Allow full vertical rotation
    controls.minPolarAngle = 0; // Allow full vertical rotation
    controls.enableRotate = true; // Ensure rotation is enabled
    controls.rotateSpeed = 0.8; // Slightly faster rotation
    controls.enablePan = true; // Allow panning
    controls.enableZoom = true; // Allow zooming
    controls.autoRotate = false; // Set to true for automatic rotation
    controls.autoRotateSpeed = 0.5;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    // Create cube
    createCube();
  }
  
  function setupPostProcessing(width: number, height: number) {
    // Create composer
    composer = new EffectComposer(renderer);
    
    // Add render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Add bloom pass
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.0,    // strength - increased for more intense glow
      0.4,    // radius - increased for wider glow
      0.6     // threshold - decreased to make more LEDs glow
    );
    composer.addPass(bloomPass);
  }
  
  function createCube() {
    cube = new THREE.Group();
    scene.add(cube);
    
    const matrixSize = LED_CONFIG.MATRIX_SIZE;
    const ledSize = 0.7; // Smaller LEDs to accommodate increased spacing
    const spacing = 1.2; // Increased spacing between LEDs
    const cubeSize = matrixSize * spacing;
    const halfCubeSize = cubeSize / 2;
    
    // Create faces
    const facePositions = [
      { name: 'top', rotationX: 0, rotationY: 0, rotationZ: 0, posZ: halfCubeSize },
      { name: 'front', rotationX: Math.PI/2, rotationY: 0, rotationZ: 0, posY: -halfCubeSize },
      { name: 'left', rotationX: 0, rotationY: -Math.PI/2, rotationZ: 0, posX: -halfCubeSize },
      { name: 'right', rotationX: 0, rotationY: Math.PI/2, rotationZ: 0, posX: halfCubeSize },
      { name: 'bottom', rotationX: Math.PI, rotationY: 0, rotationZ: 0, posZ: -halfCubeSize }
    ];
    
    // Create cube frame (white borders between matrices)
    createCubeFrame(halfCubeSize);
    
    // Create LED geometry (reused for all LEDs)
    // Use cylinder for rounded LEDs with more segments for smoother appearance
    const ledGeometry = new THREE.CylinderGeometry(ledSize/2, ledSize/2, ledSize * 0.2, 32);
    ledGeometry.rotateX(Math.PI / 2); // Rotate to face outward
    
    // Create backplate geometry
    const backplateSize = matrixSize * spacing;
    const backplateGeometry = new THREE.BoxGeometry(backplateSize, backplateSize, 0.1);
    const backplateMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2
    });
    
    // Create LEDs for each face
    for (let faceIndex = 0; faceIndex < facePositions.length; faceIndex++) {
      const face = facePositions[faceIndex];
      const faceGroup = new THREE.Group();
      
      // Apply face rotation and position
      faceGroup.rotation.x = face.rotationX;
      faceGroup.rotation.y = face.rotationY;
      faceGroup.rotation.z = face.rotationZ;
      
      if (face.posX) faceGroup.position.x = face.posX;
      if (face.posY) faceGroup.position.y = face.posY;
      if (face.posZ) faceGroup.position.z = face.posZ;
      
      // Add backplate for this face
      const backplate = new THREE.Mesh(backplateGeometry, backplateMaterial);
      backplate.position.z = -0.15; // Position slightly behind LEDs
      faceGroup.add(backplate);
      
      // Create grid for this face if needed
      if (showGrid) {
        const gridHelper = createGridHelper(matrixSize, spacing);
        faceGroup.add(gridHelper);
      }
      
      // Create LEDs for this face
      for (let row = 0; row < matrixSize; row++) {
        for (let col = 0; col < matrixSize; col++) {
          const ledIndex = faceIndex * LED_CONFIG.LEDS_PER_MATRIX + row * matrixSize + col;
          
          // Calculate LED position within the face
          const x = (col - matrixSize / 2 + 0.5) * spacing;
          const y = (matrixSize / 2 - row - 0.5) * spacing;
          
          // Create LED material with initial color
          const color = pixels[ledIndex] || [0, 0, 0];
          const ledMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color[0]/255, color[1]/255, color[2]/255),
            emissive: new THREE.Color(color[0]/255, color[1]/255, color[2]/255),
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.3
          });
          
          // Create LED mesh
          const led = new THREE.Mesh(ledGeometry, ledMaterial);
          led.position.set(x, y, 0);
          
          // Add LED lens effect (small transparent dome on top of LED)
          const lensGeometry = new THREE.SphereGeometry(ledSize/2 * 0.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          lensGeometry.translate(0, 0, ledSize * 0.1);
          const lensMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.9,
            transparent: true,
            roughness: 0.1,
            thickness: 0.05,
            ior: 1.5
          });
          const lens = new THREE.Mesh(lensGeometry, lensMaterial);
          led.add(lens);
          
          // Store reference to update later
          ledMeshes.push(led);
          
          // Add to face group
          faceGroup.add(led);
        }
      }
      
      // Add face to cube
      cube.add(faceGroup);
    }
  }
  
  function createCubeFrame(halfCubeSize: number) {
    // Create white frame material
    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.2
    });
    
    // Frame thickness
    const thickness = 0.2;
    
    // Create frame edges
    const edgeGeometry = new THREE.BoxGeometry(halfCubeSize * 2 + thickness, thickness, thickness);
    
    // Create horizontal edges (12 edges total)
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        // X-axis edges
        const edgeX = new THREE.Mesh(edgeGeometry, frameMaterial);
        edgeX.position.set(0, y * halfCubeSize, z * halfCubeSize);
        cube.add(edgeX);
      }
    }
    
    // Create vertical edges along Y axis
    const edgeYGeometry = new THREE.BoxGeometry(thickness, halfCubeSize * 2 + thickness, thickness);
    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const edgeY = new THREE.Mesh(edgeYGeometry, frameMaterial);
        edgeY.position.set(x * halfCubeSize, 0, z * halfCubeSize);
        cube.add(edgeY);
      }
    }
    
    // Create vertical edges along Z axis
    const edgeZGeometry = new THREE.BoxGeometry(thickness, thickness, halfCubeSize * 2 + thickness);
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        const edgeZ = new THREE.Mesh(edgeZGeometry, frameMaterial);
        edgeZ.position.set(x * halfCubeSize, y * halfCubeSize, 0);
        cube.add(edgeZ);
      }
    }
  }
  
  function createGridHelper(matrixSize: number, spacing: number): THREE.LineSegments {
    const gridSize = matrixSize * spacing;
    const halfGridSize = gridSize / 2;
    
    const points: THREE.Vector3[] = [];
    
    // Create horizontal lines
    for (let i = 0; i <= matrixSize; i++) {
      const pos = -halfGridSize + i * spacing;
      points.push(new THREE.Vector3(-halfGridSize, pos, 0));
      points.push(new THREE.Vector3(halfGridSize, pos, 0));
    }
    
    // Create vertical lines
    for (let i = 0; i <= matrixSize; i++) {
      const pos = -halfGridSize + i * spacing;
      points.push(new THREE.Vector3(pos, -halfGridSize, 0));
      points.push(new THREE.Vector3(pos, halfGridSize, 0));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x444444 }));
  }
  
  function updateLEDColors() {
    ledMeshes.forEach((led, index) => {
      if (index < pixels.length) {
        const color = pixels[index];
        const material = led.material as THREE.MeshStandardMaterial;
        
        // Only update if LED is on (has color)
        if (color[0] > 0 || color[1] > 0 || color[2] > 0) {
          material.color.setRGB(color[0]/255, color[1]/255, color[2]/255);
          material.emissive.setRGB(color[0]/255, color[1]/255, color[2]/255);
          
          // Increase emissive intensity for brighter LEDs
          const brightness = (color[0] + color[1] + color[2]) / 765; // 0-1 range
          material.emissiveIntensity = 0.5 + brightness * 0.5;
        } else {
          // Turn off emissive for dark LEDs
          material.emissiveIntensity = 0;
        }
        
        material.needsUpdate = true;
      }
    });
  }
  
  function updateGridVisibility(visible: boolean) {
    cube.traverse((object) => {
      if (object instanceof THREE.LineSegments) {
        object.visible = visible;
      }
    });
  }
  
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    // Update controls
    if (controls) {
      controls.update();
    }
    
    // Render scene with post-processing
    if (composer) {
      composer.render();
    }
  }
</script>

<div 
  class="w-full h-full"
  bind:this={container}
></div> 