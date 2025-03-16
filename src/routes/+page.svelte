<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { LED_CONFIG, ANIMATION_MODES } from '$lib/config';
  import { RippleAnimationEngine } from '$lib/animations/ripple';
  import FlatCubeViz from '$lib/components/FlatCubeViz.svelte';
  import CubeViz from '$lib/components/CubeViz.svelte';
  import AnimationControls from '$lib/components/AnimationControls.svelte';
  
  // Animation state
  let animationMode = ANIMATION_MODES.RIPPLE;
  let amplitude = 2000;
  let baseColor: [number, number, number] = [0.5, 0, 0.5];
  let showGrid = true;
  let rotateX = 15;
  let rotateY = 45;
  let is3D = false;
  
  // Animation engine
  let animationEngine = new RippleAnimationEngine();
  let pixels: [number, number, number][] = Array(LED_CONFIG.TOTAL_LEDS).fill([0, 0, 0]);
  let animationFrameId: number;
  let lastFrameTime = 0;
  
  // Initialize animation
  onMount(() => {
    // Start animation loop
    animationFrameId = requestAnimationFrame(updateAnimation);
  });
  
  // Clean up on component destruction
  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
  
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
  
  // Handle animation mode changes
  $: {
    // Update animation mode when it changes
    console.log(`Animation mode changed to: ${animationMode}`);
    // In a real implementation, we would switch animation engines here
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-6">LED Cube Visualizer</h1>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Visualization -->
    <div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
      <h2 class="text-xl font-semibold mb-4">{is3D ? '3D Cube' : 'Flat Map'}</h2>
      
      {#if is3D}
        <CubeViz 
          {pixels} 
          size={400} 
          {rotateX} 
          {rotateY} 
          {showGrid} 
        />
      {:else}
        <FlatCubeViz 
          {pixels} 
          size={400} 
          {showGrid} 
        />
      {/if}
    </div>
    
    <!-- Controls -->
    <div>
      <AnimationControls 
        bind:animationMode
        bind:amplitude
        bind:baseColor
        bind:showGrid
        bind:rotateX
        bind:rotateY
        bind:is3D
      />
      
      <!-- Animation Info -->
      <div class="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-2">Animation Info</h2>
        <div class="grid grid-cols-2 gap-2">
          <div class="text-sm">Mode:</div>
          <div class="text-sm font-medium">{animationMode}</div>
          
          <div class="text-sm">Amplitude:</div>
          <div class="text-sm font-medium">{amplitude}</div>
          
          <div class="text-sm">FPS:</div>
          <div class="text-sm font-medium">{Math.round(1000 / (performance.now() - lastFrameTime))}</div>
        </div>
      </div>
      
      <!-- Instructions -->
      <div class="mt-6 bg-gray-100 p-4 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">Instructions</h2>
        <ul class="list-disc pl-5 text-sm space-y-1">
          <li>Use the controls to adjust the animation parameters</li>
          <li>Toggle between 3D and flat view using the button</li>
          <li>Adjust the rotation in 3D mode using the sliders</li>
          <li>Change the base color using the RGB sliders</li>
        </ul>
      </div>
    </div>
  </div>
</div>
