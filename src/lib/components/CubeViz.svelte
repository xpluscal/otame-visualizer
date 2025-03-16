<script lang="ts">
  import { onMount } from 'svelte';
  import { LED_CONFIG } from '$lib/config';
  import { cn } from '$lib/utils';
  
  export let pixels: [number, number, number][] = [];
  export let size: number = 300;
  export let rotateX: number = 15;
  export let rotateY: number = 45;
  export let showGrid: boolean = true;
  export let zoom: number = 1;
  
  // Calculate the size of each face and cube
  $: cubeSize = size * 0.8;
  $: faceSize = cubeSize;
  $: ledSize = faceSize / LED_CONFIG.MATRIX_SIZE;
  
  // Center position for the cube
  $: centerX = size / 2;
  $: centerY = size / 2;
  
  // Get the pixels for each face
  $: topPixels = pixels.slice(0, LED_CONFIG.LEDS_PER_MATRIX);
  $: leftPixels = pixels.slice(LED_CONFIG.LEDS_PER_MATRIX, LED_CONFIG.LEDS_PER_MATRIX * 2);
  $: frontPixels = pixels.slice(LED_CONFIG.LEDS_PER_MATRIX * 2, LED_CONFIG.LEDS_PER_MATRIX * 3);
  $: rightPixels = pixels.slice(LED_CONFIG.LEDS_PER_MATRIX * 3, LED_CONFIG.LEDS_PER_MATRIX * 4);
  $: bottomPixels = pixels.slice(LED_CONFIG.LEDS_PER_MATRIX * 4, LED_CONFIG.LEDS_PER_MATRIX * 5);
  
  // Convert RGB values to CSS color strings
  function rgbToCss(rgb: [number, number, number]): string {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }
</script>

<div 
  class="relative glow"
  style="
    width: {size}px; 
    height: {size}px; 
    perspective: 1200px;
  "
>
  <div 
    class="absolute w-full h-full"
    style="
      transform-style: preserve-3d;
      transform: rotateX({rotateX}deg) rotateY({rotateY}deg) scale({zoom});
      transition: transform 0.1s ease;
      transform-origin: center center;
    "
  >
    <div
      class="absolute"
      style="
        width: {cubeSize}px;
        height: {cubeSize}px;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 50%;
        transform-style: preserve-3d;
      "
    >
      <!-- Top face -->
      <div 
        class={cn(
          "absolute flex flex-wrap",
          showGrid ? "border border-surface-400" : ""
        )}
        style="
          width: {faceSize}px; 
          height: {faceSize}px; 
          transform: rotateX(0deg) translateZ({cubeSize/2}px);
          transform-origin: center center;
        "
      >
        {#each topPixels as pixel, i}
          <div
            class={cn(
              "transition-colors duration-100",
              showGrid ? "border border-surface-300/10" : ""
            )}
            style="
              width: {ledSize}px; 
              height: {ledSize}px; 
              background-color: {rgbToCss(pixel)};
            "
          ></div>
        {/each}
      </div>
      
      <!-- Front face -->
      <div 
        class={cn(
          "absolute flex flex-wrap",
          showGrid ? "border border-surface-400" : ""
        )}
        style="
          width: {faceSize}px; 
          height: {faceSize}px; 
          transform: rotateX(90deg) translateZ({cubeSize/2}px);
          transform-origin: center center;
        "
      >
        {#each frontPixels as pixel, i}
          <div
            class={cn(
              "transition-colors duration-100",
              showGrid ? "border border-surface-300/10" : ""
            )}
            style="
              width: {ledSize}px; 
              height: {ledSize}px; 
              background-color: {rgbToCss(pixel)};
            "
          ></div>
        {/each}
      </div>
      
      <!-- Left face -->
      <div 
        class={cn(
          "absolute flex flex-wrap",
          showGrid ? "border border-surface-400" : ""
        )}
        style="
          width: {faceSize}px; 
          height: {faceSize}px; 
          transform: rotateY(-90deg) translateZ({cubeSize/2}px);
          transform-origin: center center;
        "
      >
        {#each leftPixels as pixel, i}
          <div
            class={cn(
              "transition-colors duration-100",
              showGrid ? "border border-surface-300/10" : ""
            )}
            style="
              width: {ledSize}px; 
              height: {ledSize}px; 
              background-color: {rgbToCss(pixel)};
            "
          ></div>
        {/each}
      </div>
      
      <!-- Right face -->
      <div 
        class={cn(
          "absolute flex flex-wrap",
          showGrid ? "border border-surface-400" : ""
        )}
        style="
          width: {faceSize}px; 
          height: {faceSize}px; 
          transform: rotateY(90deg) translateZ({cubeSize/2}px);
          transform-origin: center center;
        "
      >
        {#each rightPixels as pixel, i}
          <div
            class={cn(
              "transition-colors duration-100",
              showGrid ? "border border-surface-300/10" : ""
            )}
            style="
              width: {ledSize}px; 
              height: {ledSize}px; 
              background-color: {rgbToCss(pixel)};
            "
          ></div>
        {/each}
      </div>
      
      <!-- Bottom face -->
      <div 
        class={cn(
          "absolute flex flex-wrap",
          showGrid ? "border border-surface-400" : ""
        )}
        style="
          width: {faceSize}px; 
          height: {faceSize}px; 
          transform: rotateX(180deg) translateZ({cubeSize/2}px);
          transform-origin: center center;
        "
      >
        {#each bottomPixels as pixel, i}
          <div
            class={cn(
              "transition-colors duration-100",
              showGrid ? "border border-surface-300/10" : ""
            )}
            style="
              width: {ledSize}px; 
              height: {ledSize}px; 
              background-color: {rgbToCss(pixel)};
            "
          ></div>
        {/each}
      </div>
      
      <!-- Back face (optional, not visible in your setup) -->
      <!-- <div 
        class={cn(
          "absolute flex flex-wrap",
          showGrid ? "border border-surface-400" : ""
        )}
        style="
          width: {faceSize}px; 
          height: {faceSize}px; 
          transform: rotateY(180deg) translateZ({cubeSize/2}px);
          transform-origin: center center;
        "
      >
      </div> -->
    </div>
  </div>
</div> 