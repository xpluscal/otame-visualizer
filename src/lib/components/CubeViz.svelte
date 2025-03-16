<script lang="ts">
  import { onMount } from 'svelte';
  import { LED_CONFIG } from '$lib/config';
  import { cn } from '$lib/utils';
  
  export let pixels: [number, number, number][] = [];
  export let size: number = 300;
  export let rotateX: number = 15;
  export let rotateY: number = 45;
  export let showGrid: boolean = true;
  
  // Calculate the size of each face
  $: faceSize = size * 0.8;
  $: ledSize = faceSize / LED_CONFIG.MATRIX_SIZE;
  
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
  class="relative"
  style="
    width: {size}px; 
    height: {size}px; 
    perspective: 1000px;
  "
>
  <div 
    class="absolute w-full h-full"
    style="
      transform-style: preserve-3d;
      transform: rotateX({rotateX}deg) rotateY({rotateY}deg);
    "
  >
    <!-- Top face -->
    <div 
      class={cn(
        "absolute flex flex-wrap",
        showGrid ? "border border-gray-300" : ""
      )}
      style="
        width: {faceSize}px; 
        height: {faceSize}px; 
        transform: translateZ({faceSize/2}px) translateX({(size-faceSize)/2}px) translateY({(size-faceSize)/2}px);
      "
    >
      {#each topPixels as pixel, i}
        <div
          class={cn(
            "transition-colors duration-100",
            showGrid ? "border border-gray-100/10" : ""
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
        showGrid ? "border border-gray-300" : ""
      )}
      style="
        width: {faceSize}px; 
        height: {faceSize}px; 
        transform: rotateX(90deg) translateZ({faceSize/2}px) translateX({(size-faceSize)/2}px) translateY({(size-faceSize)/2}px);
      "
    >
      {#each frontPixels as pixel, i}
        <div
          class={cn(
            "transition-colors duration-100",
            showGrid ? "border border-gray-100/10" : ""
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
        showGrid ? "border border-gray-300" : ""
      )}
      style="
        width: {faceSize}px; 
        height: {faceSize}px; 
        transform: rotateY(-90deg) translateZ({faceSize/2}px) translateX({(size-faceSize)/2}px) translateY({(size-faceSize)/2}px);
      "
    >
      {#each leftPixels as pixel, i}
        <div
          class={cn(
            "transition-colors duration-100",
            showGrid ? "border border-gray-100/10" : ""
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
        showGrid ? "border border-gray-300" : ""
      )}
      style="
        width: {faceSize}px; 
        height: {faceSize}px; 
        transform: rotateY(90deg) translateZ({faceSize/2}px) translateX({(size-faceSize)/2}px) translateY({(size-faceSize)/2}px);
      "
    >
      {#each rightPixels as pixel, i}
        <div
          class={cn(
            "transition-colors duration-100",
            showGrid ? "border border-gray-100/10" : ""
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
        showGrid ? "border border-gray-300" : ""
      )}
      style="
        width: {faceSize}px; 
        height: {faceSize}px; 
        transform: rotateX(180deg) translateZ({faceSize/2}px) translateX({(size-faceSize)/2}px) translateY({(size-faceSize)/2}px);
      "
    >
      {#each bottomPixels as pixel, i}
        <div
          class={cn(
            "transition-colors duration-100",
            showGrid ? "border border-gray-100/10" : ""
          )}
          style="
            width: {ledSize}px; 
            height: {ledSize}px; 
            background-color: {rgbToCss(pixel)};
          "
        ></div>
      {/each}
    </div>
  </div>
</div> 