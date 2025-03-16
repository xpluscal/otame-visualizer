import { LED_CONFIG } from '$lib/config';
import { clamp, distance } from '$lib/utils';

export class Ripple {
  x: number;
  y: number;
  age: number;
  baseSpeed: number;
  speedNoiseOffset: number;
  directionNoiseOffset: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.baseSpeed = Math.random() * 13 + 12; // 12-25 range
    this.speedNoiseOffset = Math.random() * 1000;
    this.directionNoiseOffset = Math.random() * 1000;
  }

  update(dt: number, noise: (x: number) => number): void {
    const speedVariation = (noise(this.age * 0.15 + this.speedNoiseOffset) + 1) / 2 * 0.6 + 0.7;
    const directionVariation = noise(this.age * 0.1 + this.directionNoiseOffset) * 2 * Math.PI;
    
    const effectiveSpeed = this.baseSpeed * speedVariation;
    
    this.age += dt * effectiveSpeed;
    // More complex motion pattern
    this.x += Math.sin(this.age * 0.5 + directionVariation) * 0.3;
    this.y += Math.cos(this.age * 0.5 + directionVariation) * 0.3;
  }
}

export class RippleAnimationEngine {
  pixels: [number, number, number][];
  ripples: Ripple[];
  t: number;
  noiseT: number;
  lastUpdateTime: number;
  
  // Configuration
  amplitude = 2000;
  readonly MAX_AMPLITUDE = 10000;
  readonly MATRIX_SIZE = LED_CONFIG.MATRIX_SIZE;
  readonly TOTAL_MATRICES = LED_CONFIG.TOTAL_MATRICES;
  readonly LEDS_PER_MATRIX = LED_CONFIG.LEDS_PER_MATRIX;
  readonly TOTAL_LEDS = LED_CONFIG.TOTAL_LEDS;
  
  // Animation parameters
  BASE_SPEED_FACTOR = 1.2;
  MAX_SPEED_FACTOR = 5.0;
  MAX_RIPPLES = 8;
  NEW_RIPPLE_CHANCE = 0.1;
  RIPPLE_SPREAD = 0.2;
  SMOOTHING_FACTOR = 0.1;
  COLOR_VARIATION = 0.3;
  RIPPLE_INTENSITY = 18.0;
  MIN_INTENSITY = 0.0001;
  MAX_INTENSITY = 15.0;
  MATRIX_VARIANCE = 0.5;
  BRIGHTNESS_OSCILLATION_SPEED = 1.0;
  BRIGHTNESS_OSCILLATION_AMPLITUDE = 0.8;
  
  // Noise parameters
  NOISE_SCALE = 2.0;
  COLOR_CYCLE_PERIOD = 14;
  INTENSITY_CYCLE_PERIOD = 15;
  FACTOR_CYCLE_PERIOD = 12;
  BRIGHTNESS_CYCLE_PERIOD = 5;
  RIPPLE_SPEED_CYCLE_PERIOD = 8;
  
  // Variance parameters
  WAVE_SPEED_VARIATION = 0.7;
  COLOR_NOISE_INTENSITY = 0.28;
  BASE_VARIATION = 0.25;
  
  // Dark spot parameters
  DARK_SPOT_CHANCE = 0.15;
  DARK_SPOT_INTENSITY = 0.001;
  darkMatrices = new Set<number>();
  darkSpotDuration = 2.0;
  darkSpotTimers: Record<number, number> = {};
  
  // Base color
  BASE_COLOR: [number, number, number] = [0.5, 0, 0.5];

  constructor() {
    this.pixels = Array(this.TOTAL_LEDS).fill([0, 0, 0]);
    this.ripples = [];
    this.t = 0;
    this.noiseT = 0;
    this.lastUpdateTime = performance.now();
  }

  // Simplified Perlin noise function (since we can't use the noise library)
  noise(x: number): number {
    // Simple noise approximation
    return Math.sin(x * 0.1) * 0.5 + Math.sin(x * 0.2) * 0.3 + Math.sin(x * 0.4) * 0.2;
  }

  getNoiseValue(t: number, period: number, offset = 0): number {
    const scaledT = t / period;
    return (this.noise(scaledT + offset) + 1) / 2;
  }

  getCurrentColor(): [number, number, number] {
    const hueNoise = this.getNoiseValue(this.noiseT * 0.08, this.COLOR_CYCLE_PERIOD);
    
    let r = 0, g = 0, b = 0;
    
    if (hueNoise < 0.5) {
      // Transition from blue to red
      const blend = hueNoise * 2; // Convert 0-0.5 to 0-1
      r = blend * 0.9;
      b = (1 - blend) * 0.7;
      g = 0.0;
    } else {
      // Transition from red to blue
      const blend = (hueNoise - 0.5) * 2; // Convert 0.5-1 to 0-1
      r = (1 - blend) * 0.9;
      b = blend * 0.7;
      g = 0.0;
    }
    
    const variation = this.getNoiseValue(this.noiseT * 0.5, this.COLOR_CYCLE_PERIOD, 100) * 0.05;
    
    return [
      clamp(r + variation),
      clamp(g),
      clamp(b + variation)
    ];
  }

  updateAmplitude(newAmplitude: number): void {
    this.amplitude = Math.min(newAmplitude, this.MAX_AMPLITUDE);
  }

  update(dt: number): [number, number, number][] {
    // Ensure amplitude never goes too low or changes too abruptly
    this.amplitude = Math.max(800, Math.min(this.amplitude, this.MAX_AMPLITUDE));
    
    // Increase noise rate
    this.noiseT += 0.03;
    
    // More dramatic intensity factor
    const intensityFactor = (this.getNoiseValue(this.noiseT, this.INTENSITY_CYCLE_PERIOD) * 0.9 + 0.1);
    
    // More extreme variations
    const rippleFactor = (this.getNoiseValue(this.noiseT, this.FACTOR_CYCLE_PERIOD, 1.0) * 1.2 - 0.6);
    const speedVariation = (this.getNoiseValue(this.noiseT, this.FACTOR_CYCLE_PERIOD, 2.0) * 1.2 - 0.6);
    
    // More dramatic brightness variation
    const overallBrightness = (this.getNoiseValue(this.noiseT * 0.25, this.BRIGHTNESS_CYCLE_PERIOD, 3.0) * 0.7 + 0.6);
    
    // Calculate base intensity with more contrast
    const baseIntensity = (this.MIN_INTENSITY + 
                        (this.MAX_INTENSITY - this.MIN_INTENSITY) * 
                        intensityFactor * 0.4);
    
    // Calculate amplitude factor with more smoothing
    const amplitudeFactor = Math.pow(this.amplitude / this.MAX_AMPLITUDE, 0.8);
    
    // Update base color from noise
    this.BASE_COLOR = this.getCurrentColor();
    
    const brightnessOscillation = Math.sin(this.t * this.BRIGHTNESS_OSCILLATION_SPEED) * this.BRIGHTNESS_OSCILLATION_AMPLITUDE;
    const intensity = Math.max(this.MIN_INTENSITY, baseIntensity + brightnessOscillation * amplitudeFactor);
    
    // Calculate speed factor with noise variation
    const speedFactor = (this.BASE_SPEED_FACTOR + 
                       (this.MAX_SPEED_FACTOR - this.BASE_SPEED_FACTOR) * 
                       Math.pow(amplitudeFactor, 1.2) * 
                       speedVariation);
    
    this.t += speedFactor * dt;

    const newPixels: [number, number, number][] = Array(this.TOTAL_LEDS).fill([0, 0, 0]);

    // Calculate matrix-specific factors with occasional very dark spots
    const matrixFactors: number[] = [];
    
    // Update dark spot timers and remove expired ones
    const currentTime = performance.now() / 1000;
    const expiredDarks = Object.entries(this.darkSpotTimers)
      .filter(([, endTime]) => currentTime > endTime)
      .map(([matrix]) => parseInt(matrix));
    
    for (const matrix of expiredDarks) {
      this.darkMatrices.delete(matrix);
      delete this.darkSpotTimers[matrix];
    }
    
    // Calculate factors for each matrix
    for (let matrix = 0; matrix < this.TOTAL_MATRICES; matrix++) {
      if (this.darkMatrices.has(matrix)) {
        // This matrix is currently in a dark state
        matrixFactors.push(this.DARK_SPOT_INTENSITY);
      } else if (Math.random() < this.DARK_SPOT_CHANCE && this.darkMatrices.size < this.TOTAL_MATRICES / 3) {
        // Create new dark spot
        this.darkMatrices.add(matrix);
        this.darkSpotTimers[matrix] = currentTime + this.darkSpotDuration;
        matrixFactors.push(this.DARK_SPOT_INTENSITY);
      } else {
        // Normal brightness variation
        matrixFactors.push(Math.random() * this.MATRIX_VARIANCE * 2 + (1 - this.MATRIX_VARIANCE));
      }
    }

    // Update base color with more pronounced variation and matrix-specific factors
    for (let i = 0; i < this.TOTAL_LEDS; i++) {
      const matrixIndex = Math.floor(i / this.LEDS_PER_MATRIX);
      const matrixFactor = matrixFactors[matrixIndex];
      const baseVariation = this.BASE_VARIATION * Math.sin(this.t * 5 + i * 0.5);
      
      const color: [number, number, number] = [
        clamp(this.BASE_COLOR[0] + baseVariation + this.COLOR_VARIATION * Math.sin(this.t * 3 + i * 0.3)),
        clamp(this.BASE_COLOR[1] + this.COLOR_VARIATION * Math.sin(this.t * 3 + i * 0.3)),
        clamp(this.BASE_COLOR[2] + baseVariation + this.COLOR_VARIATION * Math.sin(this.t * 3 + i * 0.3))
      ];
      
      // Apply intensity, matrix factor, and additional brightness variation
      const additionalBrightness = Math.random() * 0.2 - 0.1;  // Add small random brightness variation
      newPixels[i] = [
        color[0] * intensity * matrixFactor * (1 + additionalBrightness) + baseVariation * amplitudeFactor,
        color[1] * intensity * matrixFactor * (1 + additionalBrightness),
        color[2] * intensity * matrixFactor * (1 + additionalBrightness) + baseVariation * amplitudeFactor
      ];
    }

    // Chance to create a new ripple
    if (this.ripples.length < this.MAX_RIPPLES && Math.random() < this.NEW_RIPPLE_CHANCE) {
      const x = Math.random() * this.MATRIX_SIZE * this.TOTAL_MATRICES;
      const y = Math.random() * this.MATRIX_SIZE * this.TOTAL_MATRICES;
      this.ripples.push(new Ripple(x, y));
    }

    // Update and render ripples
    for (const ripple of this.ripples) {
      ripple.update(dt * speedFactor, (x) => this.noise(x));
      
      for (let i = 0; i < this.TOTAL_LEDS; i++) {
        const matrixX = Math.floor(i / this.LEDS_PER_MATRIX) % 2;
        const matrixY = Math.floor(Math.floor(i / this.LEDS_PER_MATRIX) / 2);
        const localI = i % this.LEDS_PER_MATRIX;
        const x = localI % this.MATRIX_SIZE + matrixX * this.MATRIX_SIZE;
        const y = Math.floor(localI / this.MATRIX_SIZE) + matrixY * this.MATRIX_SIZE;

        const d = distance(x, y, ripple.x, ripple.y);
        let rippleIntensity = Math.exp(-Math.pow(d - ripple.age, 2) / (2 * Math.pow(this.RIPPLE_SPREAD, 2)));
        
        // Scale ripple intensity with amplitude and matrix factor
        const matrixIndex = Math.floor(i / this.LEDS_PER_MATRIX);
        rippleIntensity = (rippleIntensity * 
                          (0.95 + 0.05 * intensityFactor) *
                          this.RIPPLE_INTENSITY * 
                          matrixFactors[matrixIndex] * 1.5);
        
        // Add ripple effect to the existing color
        newPixels[i] = [
          clamp(newPixels[i][0] + rippleIntensity, 0, 1),
          clamp(newPixels[i][1] + rippleIntensity, 0, 1),
          clamp(newPixels[i][2] + rippleIntensity, 0, 1)
        ];
      }
    }

    // Apply overall brightness to all pixels
    newPixels.forEach((pixel, i) => {
      newPixels[i] = [
        pixel[0] * overallBrightness,
        pixel[1] * overallBrightness,
        pixel[2] * overallBrightness
      ];
    });

    // Apply smoothing
    this.pixels = this.pixels.map((pixel, i) => [
      pixel[0] * (1 - this.SMOOTHING_FACTOR) + newPixels[i][0] * this.SMOOTHING_FACTOR,
      pixel[1] * (1 - this.SMOOTHING_FACTOR) + newPixels[i][1] * this.SMOOTHING_FACTOR,
      pixel[2] * (1 - this.SMOOTHING_FACTOR) + newPixels[i][2] * this.SMOOTHING_FACTOR
    ]);

    // Remove old ripples
    this.ripples = this.ripples.filter(r => r.age < this.MATRIX_SIZE * this.TOTAL_MATRICES);

    // Update ripple parameters with more intensity
    this.RIPPLE_INTENSITY = 12.0 * (0.7 + 0.6 * rippleFactor);
    this.NEW_RIPPLE_CHANCE = 0.08 * (0.7 + 0.6 * rippleFactor);

    // Convert to RGB values (0-255)
    return this.pixels.map(pixel => [
      Math.floor(clamp(pixel[0]) * 255),
      Math.floor(clamp(pixel[1]) * 255),
      Math.floor(clamp(pixel[2]) * 255)
    ]);
  }

  setBaseColor(r: number, g: number, b: number): void {
    this.BASE_COLOR = [clamp(r), clamp(g), clamp(b)];
  }
} 