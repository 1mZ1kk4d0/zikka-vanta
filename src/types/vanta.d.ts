/**
 * Type definitions for Vanta.js - 3D animated backgrounds
 */

declare global {
  interface Number {
    clamp(min: number, max: number): number;
  }

  interface Window {
    VANTA?: Vanta;
    THREE?: unknown;
    p5?: unknown;
  }
}

/** Minimal THREE.js types for Vanta (use @types/three for full types) */
export type THREE = typeof import('three') | Record<string, unknown>;

/** Base options for all Vanta effects */
export interface VantaBaseOptions {
  el: HTMLElement | string;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
  backgroundColor?: number | string;
  backgroundAlpha?: number;
  background?: string;
  speed?: number;
  mouseEase?: boolean;
  forceAnimate?: boolean;
  pixelated?: boolean;
  texturePath?: string;
  THREE?: THREE;
}

/** Options for BIRDS effect */
export interface VantaBirdsOptions extends VantaBaseOptions {
  color1?: number | string;
  color2?: number | string;
  colorMode?: 'lerp' | 'variance' | 'lerpGradient' | 'varianceGradient';
  birdSize?: number;
  wingSpan?: number;
  speedLimit?: number;
  separation?: number;
  alignment?: number;
  cohesion?: number;
  quantity?: number;
}

/** Options for FOG effect */
export interface VantaFogOptions extends VantaBaseOptions {
  highlightColor?: number | string;
  midtoneColor?: number | string;
  lowlightColor?: number | string;
  baseColor?: number | string;
  blurFactor?: number;
  zoom?: number;
}

/** Options for WAVES effect */
export interface VantaWavesOptions extends VantaBaseOptions {
  color?: number | string;
  shininess?: number;
  waveHeight?: number;
  waveSpeed?: number;
  zoom?: number;
}

/** Options for NET effect */
export interface VantaNetOptions extends VantaBaseOptions {
  color?: number | string;
  points?: number;
  maxDistance?: number;
  spacing?: number;
  showDots?: boolean;
}

/** Options for DOTS effect */
export interface VantaDotsOptions extends VantaBaseOptions {
  color?: number | string;
  color2?: number | string;
  size?: number;
  spacing?: number;
  showLines?: boolean;
}

/** Options for CELLS effect */
export interface VantaCellsOptions extends VantaBaseOptions {
  color1?: number | string;
  color2?: number | string;
  size?: number;
  amplitudeFactor?: number;
  ringFactor?: number;
  rotationFactor?: number;
}

/** Options for CLOUDS effect */
export interface VantaCloudsOptions extends VantaBaseOptions {
  skyColor?: number | string;
  cloudColor?: number | string;
  cloudShadowColor?: number | string;
  sunColor?: number | string;
  sunGlareColor?: number | string;
  sunlightColor?: number | string;
}

/** Options for CLOUDS2 effect */
export interface VantaClouds2Options extends VantaBaseOptions {
  skyColor?: number | string;
  cloudColor?: number | string;
  lightColor?: number | string;
}

/** Options for GLOBE effect */
export interface VantaGlobeOptions extends VantaBaseOptions {
  color?: number | string;
  color2?: number | string;
  size?: number;
}

/** Options for TRUNK effect */
export interface VantaTrunkOptions extends VantaBaseOptions {
  color?: number | string;
  spacing?: number;
  chaos?: number;
}

/** Options for TOPOLOGY effect */
export interface VantaTopologyOptions extends VantaBaseOptions {
  color?: number | string;
}

/** Options for RINGS effect */
export interface VantaRingsOptions extends VantaBaseOptions {
  color?: number | string;
}

/** Options for HALO effect */
export interface VantaHaloOptions extends VantaBaseOptions {
  baseColor?: number | string;
  size?: number;
  amplitudeFactor?: number;
  xOffset?: number;
  yOffset?: number;
}

/** Options for RIPPLE effect */
export interface VantaRippleOptions extends VantaBaseOptions {
  color1?: number | string;
  color2?: number | string;
  amplitudeFactor?: number;
  ringFactor?: number;
  rotationFactor?: number;
}

/** Vanta effect instance - common API for all effects */
export interface VantaEffect {
  destroy: () => void;
  setOptions: (options: Partial<VantaBaseOptions>) => void;
  restart: () => void;
  options: VantaBaseOptions;
  el: HTMLElement;
  name?: string;
  [key: string]: unknown;
}

/** VANTA namespace - register effects and create instances */
export interface Vanta {
  version: string;
  current: VantaEffect | null;
  register: <T extends VantaBaseOptions>(
    name: string,
    Effect: new (opts: T) => VantaEffect
  ) => (opts: T) => VantaEffect;
  BIRDS: (opts: VantaBirdsOptions) => VantaEffect;
  FOG: (opts: VantaFogOptions) => VantaEffect;
  WAVES: (opts: VantaWavesOptions) => VantaEffect;
  CLOUDS: (opts: VantaCloudsOptions) => VantaEffect;
  CLOUDS2: (opts: VantaClouds2Options) => VantaEffect;
  GLOBE: (opts: VantaGlobeOptions) => VantaEffect;
  NET: (opts: VantaNetOptions) => VantaEffect;
  CELLS: (opts: VantaCellsOptions) => VantaEffect;
  TRUNK: (opts: VantaTrunkOptions) => VantaEffect;
  TOPOLOGY: (opts: VantaTopologyOptions) => VantaEffect;
  DOTS: (opts: VantaDotsOptions) => VantaEffect;
  RINGS: (opts: VantaRingsOptions) => VantaEffect;
  HALO: (opts: VantaHaloOptions) => VantaEffect;
  RIPPLE: (opts: VantaRippleOptions) => VantaEffect;
  [effectName: string]: ((opts: VantaBaseOptions) => VantaEffect) | string | VantaEffect | null | undefined;
}

export type { Vanta, VantaEffect };
