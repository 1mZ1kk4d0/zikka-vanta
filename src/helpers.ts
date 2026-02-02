declare global {
  interface Number {
    clamp(min: number, max: number): number;
  }
}

Number.prototype.clamp = function (this: number, min: number, max: number): number {
  return Math.min(Math.max(Number(this), min), max);
};

export function mobileCheck(): boolean | null {
  if (typeof navigator !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 600;
  }
  return null;
}

export const sample = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export function rn(start?: number | null, end?: number | null): number {
  if (start == null) start = 0;
  if (end == null) end = 1;
  return start + Math.random() * (end - start);
}

export function ri(start?: number | null, end?: number | null): number {
  if (start == null) start = 0;
  if (end == null) end = 1;
  return Math.floor(start + Math.random() * (end - start + 1));
}

export const q = (sel: string): Element | null => document.querySelector(sel);

export const color2Hex = (color: number | string): string => {
  if (typeof color === 'number') {
    return '#' + ('00000' + color.toString(16)).slice(-6);
  }
  return color;
};

export const color2Rgb = (color: number | string, alpha = 1): string => {
  const hex = color2Hex(color);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const obj = result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
  return obj ? `rgba(${obj.r},${obj.g},${obj.b},${alpha})` : '';
};

export const getBrightness = (threeColor: { r: number; g: number; b: number }): number => {
  return 0.299 * threeColor.r + 0.587 * threeColor.g + 0.114 * threeColor.b;
};

export function clearThree(obj: {
  children?: { length: number; [i: number]: unknown };
  geometry?: { dispose: () => void };
  material?: Record<string, unknown>;
  remove: (child: unknown) => void;
}): void {
  while (obj.children && obj.children.length > 0) {
    clearThree(obj.children[0] as Parameters<typeof clearThree>[0]);
    obj.remove(obj.children[0]);
  }
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    Object.keys(obj.material).forEach((prop) => {
      const val = obj.material![prop];
      if (!val) return;
      if (val !== null && typeof (val as { dispose?: () => void }).dispose === 'function') {
        (val as { dispose: () => void }).dispose();
      }
    });
    if (typeof (obj.material as { dispose?: () => void }).dispose === 'function') {
      (obj.material as { dispose: () => void }).dispose();
    }
  }
}
