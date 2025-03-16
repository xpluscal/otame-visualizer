<script lang="ts">
  import { LED_CONFIG } from '$lib/config';
  import LedMatrix from './LedMatrix.svelte';
  
  export let pixels: [number, number, number][] = [];
  export let size: number = 300;
  export let showGrid: boolean = true;
  
  // Calculate the size of each matrix
  $: matrixSize = size / 3;
</script>

<div class="relative grid grid-cols-3 gap-1">
  <!-- Empty top-left -->
  <div></div>
  
  <!-- Top matrix (0) -->
  <div>
    <LedMatrix 
      {pixels} 
      matrixIndex={0} 
      size={matrixSize} 
      {showGrid} 
    />
  </div>
  
  <!-- Empty top-right -->
  <div></div>
  
  <!-- Left matrix (1) -->
  <div>
    <LedMatrix 
      {pixels} 
      matrixIndex={1} 
      size={matrixSize} 
      {showGrid} 
    />
  </div>
  
  <!-- Front matrix (2) -->
  <div>
    <LedMatrix 
      {pixels} 
      matrixIndex={2} 
      size={matrixSize} 
      {showGrid} 
    />
  </div>
  
  <!-- Right matrix (3) -->
  <div>
    <LedMatrix 
      {pixels} 
      matrixIndex={3} 
      size={matrixSize} 
      {showGrid} 
    />
  </div>
  
  <!-- Empty bottom-left -->
  <div></div>
  
  <!-- Bottom matrix (4) -->
  <div>
    <LedMatrix 
      {pixels} 
      matrixIndex={4} 
      size={matrixSize} 
      {showGrid} 
    />
  </div>
  
  <!-- Empty bottom-right -->
  <div></div>
</div> 