<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { LED_CONFIG, ANIMATION_MODES } from '$lib/config';
  import { RippleAnimationEngine } from '$lib/animations/ripple';
  import FlatCubeViz from '$lib/components/FlatCubeViz.svelte';
  import CubeViz from '$lib/components/CubeViz.svelte';
  import ThreeCubeViz from '$lib/components/ThreeCubeViz.svelte';
  import AnimationControls from '$lib/components/AnimationControls.svelte';
  
  // Animation state
  let animationMode = ANIMATION_MODES.RIPPLE;
  let amplitude = 2000;
  let baseColor: [number, number, number] = [0.5, 0, 0.5];
  let showGrid = false; // Default to no grid
  let rotateX = 15;
  let rotateY = 45;
  let is3D = true; // Default to 3D view
  let useThreeJs = true; // Default to Three.js version
  
  // Orbital controls
  let zoom = 1;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  // Animation engine
  let animationEngine = new RippleAnimationEngine();
  let pixels: [number, number, number][] = Array(LED_CONFIG.TOTAL_LEDS).fill([0, 0, 0]);
  let animationFrameId: number;
  let lastFrameTime = 0;
  
  // Visualization container reference
  let vizContainer: HTMLElement;
  
  // Viewport dimensions
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  
  // Initialize animation
  onMount(() => {
    // Add window resize listener
    const handleResize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(updateAnimation);
    
    // Add event listeners for orbital controls (only used for CSS 3D version)
    if (vizContainer && !useThreeJs) {
      vizContainer.addEventListener('mousedown', handleMouseDown);
      vizContainer.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  // Clean up on component destruction
  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    // Remove event listeners
    if (vizContainer) {
      vizContainer.removeEventListener('mousedown', handleMouseDown);
      vizContainer.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  });
  
  // Calculate visualization size
  $: vizSize = Math.min(viewportHeight * 0.8, viewportWidth * 0.5);
  
  // Animation update function
  function updateAnimation(timestamp: number) {
    // Calculate delta time in seconds
    const dt = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;
    
    // Update animation parameters
    animationEngine.updateAmplitude(amplitude);
    animationEngine.setBaseColor(baseColor[0], baseColor[1], baseColor[2]);
    
    // Update animation
    pixels = animationEngine.update(dt);
    
    // Request next frame
    animationFrameId = requestAnimationFrame(updateAnimation);
  }
  
  // Orbital control handlers (only used for CSS 3D version)
  function handleMouseDown(event: MouseEvent) {
    if (is3D && !useThreeJs) {
      isDragging = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      event.preventDefault();
    }
  }
  
  function handleMouseMove(event: MouseEvent) {
    if (isDragging && is3D && !useThreeJs) {
      const deltaX = event.clientX - lastMouseX;
      const deltaY = event.clientY - lastMouseY;
      
      rotateY += deltaX * 0.5;
      rotateX += deltaY * 0.5;
      
      // Limit rotation on X axis to prevent flipping
      rotateX = Math.max(-90, Math.min(90, rotateX));
      
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
  }
  
  function handleMouseUp() {
    isDragging = false;
  }
  
  function handleWheel(event: WheelEvent) {
    if (is3D && !useThreeJs) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      zoom = Math.max(0.5, Math.min(2, zoom + delta));
    }
  }
  
  // Toggle between CSS 3D and Three.js
  function toggleRenderer() {
    useThreeJs = !useThreeJs;
    
    // Update event listeners
    if (vizContainer) {
      if (useThreeJs) {
        // Remove CSS 3D event listeners
        vizContainer.removeEventListener('mousedown', handleMouseDown);
        vizContainer.removeEventListener('wheel', handleWheel);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      } else {
        // Add CSS 3D event listeners
        vizContainer.addEventListener('mousedown', handleMouseDown);
        vizContainer.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
    }
  }
  
  // Handle animation mode changes
  $: {
    // Update animation mode when it changes
    console.log(`Animation mode changed to: ${animationMode}`);
    // In a real implementation, we would switch animation engines here
  }
</script>

<div class="app-container flex flex-col md:flex-row">
  <!-- Visualization Section (2/3 width, full height) -->
  <div 
    class="visualization-container w-full md:w-2/3 h-screen flex items-center justify-center bg-surface-50"
    bind:this={vizContainer}
    style="cursor: {isDragging && !useThreeJs ? 'grabbing' : 'grab'};"
  >
    {#if is3D}
      {#if useThreeJs}
        <div class="w-full h-full">
          <ThreeCubeViz 
            {pixels} 
            size={vizSize}
            {showGrid}
          />
        </div>
      {:else}
        <div class="w-full h-full flex items-center justify-center">
          <CubeViz 
            {pixels} 
            size={vizSize} 
            {rotateX} 
            {rotateY} 
            {showGrid}
            {zoom}
          />
        </div>
      {/if}
    {:else}
      <div class="w-full h-full flex items-center justify-center">
        <FlatCubeViz 
          {pixels} 
          size={vizSize}
          {showGrid} 
        />
      </div>
    {/if}
  </div>
  
  <!-- Controls Section (1/3 width, full height) -->
  <div class="controls-container w-full md:w-1/3 h-screen bg-surface-100 p-6 overflow-y-auto">
    <AnimationControls 
      bind:animationMode
      bind:amplitude
      bind:baseColor
      bind:showGrid
      bind:rotateX
      bind:rotateY
      bind:is3D
      bind:zoom
    />
    
    <!-- Renderer Toggle -->
    {#if is3D}
      <div class="mt-6 bg-surface-200 p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-2 text-text-primary">Renderer Options</h2>
        <button 
          class="w-full px-4 py-2 rounded-md transition-all bg-primary text-text-primary glow"
          on:click={toggleRenderer}
        >
          {useThreeJs ? "Using Three.js (3D)" : "Using CSS 3D Transform"}
        </button>
        <p class="mt-2 text-sm text-text-secondary">
          {useThreeJs 
            ? "Three.js provides better performance and proper 3D lighting." 
            : "CSS 3D transforms are simpler but less performant."}
        </p>
      </div>
    {/if}
    
    <!-- Animation Info -->
    <div class="mt-6 bg-surface-200 p-4 rounded-lg">
      <h2 class="text-xl font-semibold mb-2 text-text-primary">Animation Info</h2>
      <div class="grid grid-cols-2 gap-2">
        <div class="text-sm text-text-secondary">Mode:</div>
        <div class="text-sm font-medium text-text-primary">{animationMode}</div>
        
        <div class="text-sm text-text-secondary">Amplitude:</div>
        <div class="text-sm font-medium text-text-primary">{amplitude}</div>
        
        <div class="text-sm text-text-secondary">FPS:</div>
        <div class="text-sm font-medium text-text-primary">{Math.round(1000 / (performance.now() - lastFrameTime))}</div>
        
        {#if is3D && !useThreeJs}
          <div class="text-sm text-text-secondary">Zoom:</div>
          <div class="text-sm font-medium text-text-primary">{zoom.toFixed(2)}x</div>
        {/if}
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="mt-6 bg-surface-200 p-4 rounded-lg">
      <h2 class="text-lg font-semibold mb-2 text-text-primary">Instructions</h2>
      <ul class="list-disc pl-5 text-sm space-y-1 text-text-secondary">
        <li>Use the controls to adjust the animation parameters</li>
        <li>Toggle between 3D and flat view using the button</li>
        <li>In 3D mode, click and drag to rotate the cube</li>
        <li>Use the mouse wheel to zoom in and out</li>
        <li>Adjust the base color using the RGB sliders</li>
        <li>Try both Three.js and CSS 3D renderers</li>
      </ul>
    </div>
  </div>
</div>
