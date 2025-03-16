export const LED_CONFIG = {
  MATRIX_SIZE: 8,
  TOTAL_MATRICES: 5,
  LEDS_PER_MATRIX: 64, // 8x8
  TOTAL_LEDS: 320 // 5 matrices of 64 LEDs each
};

export const ANIMATION_MODES = {
  RIPPLE: 'ripple',
  NOISE: 'noise',
  SOLID: 'solid',
  RAINBOW: 'rainbow',
  PULSE: 'pulse'
};

export const DEFAULT_ANIMATION = ANIMATION_MODES.RIPPLE; 