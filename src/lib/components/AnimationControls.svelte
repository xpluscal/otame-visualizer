<script lang="ts">
  import { ANIMATION_MODES } from '$lib/config';
  import { cn } from '$lib/utils';
  
  export let animationMode: string = ANIMATION_MODES.RIPPLE;
  export let amplitude: number = 2000;
  export let baseColor: [number, number, number] = [0.5, 0, 0.5];
  export let showGrid: boolean = true;
  export let rotateX: number = 15;
  export let rotateY: number = 45;
  export let is3D: boolean = false;
  export let zoom: number = 1;
  
  // Animation mode options
  const animationOptions = Object.values(ANIMATION_MODES);
  
  // Handle animation mode change
  function handleModeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    animationMode = target.value;
  }
  
  // Handle amplitude change
  function handleAmplitudeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    amplitude = parseInt(target.value);
  }
  
  // Handle color changes
  function handleRedChange(event: Event) {
    const target = event.target as HTMLInputElement;
    baseColor = [parseFloat(target.value) / 255, baseColor[1], baseColor[2]];
  }
  
  function handleGreenChange(event: Event) {
    const target = event.target as HTMLInputElement;
    baseColor = [baseColor[0], parseFloat(target.value) / 255, baseColor[2]];
  }
  
  function handleBlueChange(event: Event) {
    const target = event.target as HTMLInputElement;
    baseColor = [baseColor[0], baseColor[1], parseFloat(target.value) / 255];
  }
  
  // Handle rotation changes
  function handleRotateXChange(event: Event) {
    const target = event.target as HTMLInputElement;
    rotateX = parseInt(target.value);
  }
  
  function handleRotateYChange(event: Event) {
    const target = event.target as HTMLInputElement;
    rotateY = parseInt(target.value);
  }
  
  // Handle zoom change
  function handleZoomChange(event: Event) {
    const target = event.target as HTMLInputElement;
    zoom = parseFloat(target.value);
  }
  
  // Toggle 3D view
  function toggle3D() {
    is3D = !is3D;
  }
  
  // Toggle grid
  function toggleGrid() {
    showGrid = !showGrid;
  }
  
  // Reset rotation
  function resetRotation() {
    rotateX = 15;
    rotateY = 45;
    zoom = 1;
  }
</script>

<div class="bg-surface-200 p-4 rounded-lg">
  <h2 class="text-xl font-bold mb-4 text-text-primary">Animation Controls</h2>
  
  <div class="grid grid-cols-1 gap-4">
    <!-- Animation Mode -->
    <div class="mb-4">
      <label for="animation-mode" class="block text-sm font-medium mb-1 text-text-secondary">Animation Mode</label>
      <select 
        id="animation-mode" 
        class="w-full p-2 border border-surface-400 rounded-md bg-surface-300 text-text-primary"
        value={animationMode}
        on:change={handleModeChange}
      >
        {#each animationOptions as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>
    
    <!-- Amplitude -->
    <div class="mb-4">
      <label for="amplitude" class="block text-sm font-medium mb-1 text-text-secondary">
        Amplitude: {amplitude}
      </label>
      <input 
        id="amplitude" 
        type="range" 
        min="0" 
        max="10000" 
        step="100"
        class="w-full"
        value={amplitude}
        on:input={handleAmplitudeChange}
      />
    </div>
    
    <!-- Color Controls -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2 text-text-primary">Base Color</h3>
      <div class="grid grid-cols-3 gap-4">
        <!-- Red -->
        <div>
          <label for="red" class="block text-sm font-medium mb-1 text-text-secondary">
            Red: {Math.round(baseColor[0] * 255)}
          </label>
          <input 
            id="red" 
            type="range" 
            min="0" 
            max="255" 
            class="w-full"
            value={baseColor[0] * 255}
            on:input={handleRedChange}
          />
        </div>
        
        <!-- Green -->
        <div>
          <label for="green" class="block text-sm font-medium mb-1 text-text-secondary">
            Green: {Math.round(baseColor[1] * 255)}
          </label>
          <input 
            id="green" 
            type="range" 
            min="0" 
            max="255" 
            class="w-full"
            value={baseColor[1] * 255}
            on:input={handleGreenChange}
          />
        </div>
        
        <!-- Blue -->
        <div>
          <label for="blue" class="block text-sm font-medium mb-1 text-text-secondary">
            Blue: {Math.round(baseColor[2] * 255)}
          </label>
          <input 
            id="blue" 
            type="range" 
            min="0" 
            max="255" 
            class="w-full"
            value={baseColor[2] * 255}
            on:input={handleBlueChange}
          />
        </div>
      </div>
      
      <!-- Color Preview -->
      <div class="mt-2 flex items-center">
        <div 
          class="w-8 h-8 rounded-full border border-surface-400 mr-2 glow"
          style="background-color: rgb({baseColor[0] * 255}, {baseColor[1] * 255}, {baseColor[2] * 255});"
        ></div>
        <span class="text-sm text-text-secondary">
          RGB({Math.round(baseColor[0] * 255)}, {Math.round(baseColor[1] * 255)}, {Math.round(baseColor[2] * 255)})
        </span>
      </div>
    </div>
    
    <!-- 3D Controls (only shown when 3D is enabled) -->
    {#if is3D}
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-semibold text-text-primary">3D Controls</h3>
          <button 
            class="px-2 py-1 text-xs rounded-md bg-surface-400 text-text-primary hover:bg-surface-500"
            on:click={resetRotation}
          >
            Reset View
          </button>
        </div>
        
        <div class="grid grid-cols-1 gap-4 mb-4">
          <!-- Zoom -->
          <div>
            <label for="zoom" class="block text-sm font-medium mb-1 text-text-secondary">
              Zoom: {zoom.toFixed(2)}x
            </label>
            <input 
              id="zoom" 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.05"
              class="w-full"
              value={zoom}
              on:input={handleZoomChange}
            />
          </div>
          
          <!-- Rotate X -->
          <div>
            <label for="rotate-x" class="block text-sm font-medium mb-1 text-text-secondary">
              Rotate X: {rotateX}°
            </label>
            <input 
              id="rotate-x" 
              type="range" 
              min="-90" 
              max="90" 
              class="w-full"
              value={rotateX}
              on:input={handleRotateXChange}
            />
          </div>
          
          <!-- Rotate Y -->
          <div>
            <label for="rotate-y" class="block text-sm font-medium mb-1 text-text-secondary">
              Rotate Y: {rotateY}°
            </label>
            <input 
              id="rotate-y" 
              type="range" 
              min="-180" 
              max="180" 
              class="w-full"
              value={rotateY}
              on:input={handleRotateYChange}
            />
          </div>
        </div>
        
        <div class="text-xs text-text-muted italic">
          Tip: You can also click and drag the cube to rotate, and use the mouse wheel to zoom.
        </div>
      </div>
    {/if}
    
    <!-- Toggle Buttons -->
    <div class="flex space-x-4">
      <button 
        class={cn(
          "px-4 py-2 rounded-md flex-1 transition-all",
          is3D 
            ? "bg-primary text-text-primary glow" 
            : "bg-surface-400 text-text-primary hover:bg-surface-500"
        )}
        on:click={toggle3D}
      >
        {is3D ? "3D View" : "Flat View"}
      </button>
      
      <button 
        class={cn(
          "px-4 py-2 rounded-md flex-1 transition-all",
          showGrid 
            ? "bg-primary text-text-primary glow" 
            : "bg-surface-400 text-text-primary hover:bg-surface-500"
        )}
        on:click={toggleGrid}
      >
        {showGrid ? "Hide Grid" : "Show Grid"}
      </button>
    </div>
  </div>
</div> 