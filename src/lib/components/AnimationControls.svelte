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
  
  // Toggle 3D view
  function toggle3D() {
    is3D = !is3D;
  }
  
  // Toggle grid
  function toggleGrid() {
    showGrid = !showGrid;
  }
</script>

<div class="bg-gray-100 p-4 rounded-lg shadow-md">
  <h2 class="text-xl font-bold mb-4">Animation Controls</h2>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Animation Mode -->
    <div class="mb-4">
      <label for="animation-mode" class="block text-sm font-medium mb-1">Animation Mode</label>
      <select 
        id="animation-mode" 
        class="w-full p-2 border border-gray-300 rounded-md"
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
      <label for="amplitude" class="block text-sm font-medium mb-1">
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
    <div class="mb-4 col-span-1 md:col-span-2">
      <h3 class="text-lg font-semibold mb-2">Base Color</h3>
      <div class="grid grid-cols-3 gap-4">
        <!-- Red -->
        <div>
          <label for="red" class="block text-sm font-medium mb-1">
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
          <label for="green" class="block text-sm font-medium mb-1">
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
          <label for="blue" class="block text-sm font-medium mb-1">
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
          class="w-8 h-8 rounded-full border border-gray-300 mr-2"
          style="background-color: rgb({baseColor[0] * 255}, {baseColor[1] * 255}, {baseColor[2] * 255});"
        ></div>
        <span class="text-sm">
          RGB({Math.round(baseColor[0] * 255)}, {Math.round(baseColor[1] * 255)}, {Math.round(baseColor[2] * 255)})
        </span>
      </div>
    </div>
    
    <!-- 3D Controls (only shown when 3D is enabled) -->
    {#if is3D}
      <div class="mb-4 col-span-1 md:col-span-2">
        <h3 class="text-lg font-semibold mb-2">3D Rotation</h3>
        <div class="grid grid-cols-2 gap-4">
          <!-- Rotate X -->
          <div>
            <label for="rotate-x" class="block text-sm font-medium mb-1">
              Rotate X: {rotateX}°
            </label>
            <input 
              id="rotate-x" 
              type="range" 
              min="-180" 
              max="180" 
              class="w-full"
              value={rotateX}
              on:input={handleRotateXChange}
            />
          </div>
          
          <!-- Rotate Y -->
          <div>
            <label for="rotate-y" class="block text-sm font-medium mb-1">
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
      </div>
    {/if}
    
    <!-- Toggle Buttons -->
    <div class="flex space-x-4 col-span-1 md:col-span-2">
      <button 
        class={cn(
          "px-4 py-2 rounded-md",
          is3D ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
        )}
        on:click={toggle3D}
      >
        {is3D ? "3D View" : "Flat View"}
      </button>
      
      <button 
        class={cn(
          "px-4 py-2 rounded-md",
          showGrid ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
        )}
        on:click={toggleGrid}
      >
        {showGrid ? "Hide Grid" : "Show Grid"}
      </button>
    </div>
  </div>
</div> 