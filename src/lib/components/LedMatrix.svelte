<script lang="ts">
  import { LED_CONFIG } from '$lib/config';
  import { cn } from '$lib/utils';
  
  export let pixels: [number, number, number][] = [];
  export let matrixIndex: number = 0;
  export let size: number = 300;
  export let showGrid: boolean = true;
  
  // Calculate the size of each LED
  $: ledSize = size / LED_CONFIG.MATRIX_SIZE;
  
  // Get the pixels for this specific matrix
  $: matrixPixels = pixels.slice(
    matrixIndex * LED_CONFIG.LEDS_PER_MATRIX,
    (matrixIndex + 1) * LED_CONFIG.LEDS_PER_MATRIX
  );
  
  // Convert RGB values to CSS color strings
  function rgbToCss(rgb: [number, number, number]): string {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }
</script>

<div 
  class={cn(
    "relative flex flex-wrap",
    showGrid ? "border border-surface-400" : ""
  )}
  style="width: {size}px; height: {size}px;"
>
  {#each matrixPixels as pixel, i}
    <div
      class={cn(
        "transition-colors duration-100",
        showGrid ? "border border-surface-300/10" : ""
      )}
      style="
        width: {ledSize}px; 
        height: {ledSize}px; 
        background-color: {rgbToCss(pixel)};
        box-shadow: 0 0 5px {rgbToCss(pixel)};
      "
    ></div>
  {/each}
</div> 