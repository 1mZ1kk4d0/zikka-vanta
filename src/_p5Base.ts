import VantaBase from './_base';
import { color2Hex } from './helpers';
import type { VantaBaseOptions } from './types/vanta';

export { VANTA } from './_base';

declare global {
  interface Window {
    p5?: unknown;
  }
}

let p5: unknown = typeof window === 'object' ? (window as Window & { p5?: unknown }).p5 : undefined;

export default class P5Base extends VantaBase {
  declare p5?: { remove?: () => void; resizeCanvas?: (w: number, h: number) => void; canvas?: HTMLElement };
  declare p5renderer?: { canvas: HTMLElement };
  declare p5canvas?: HTMLElement;

  constructor(userOptions: VantaBaseOptions & { p5?: unknown }) {
    p5 = userOptions.p5 ?? p5;
    super(userOptions);
    (this as unknown as { mode: string }).mode = 'p5';
  }

  initP5(p: { createCanvas: (w: number, h: number) => { parent: (el: HTMLElement) => void; canvas: HTMLElement }; canvas: HTMLElement }): void {
    const t = this;
    const renderer = p.createCanvas(t.width, t.height);
    renderer.parent(t.el);
    t.applyCanvasStyles(p.canvas, {
      background: color2Hex(t.options.backgroundColor as number | string),
    });
    (t as unknown as { p5renderer: typeof renderer }).p5renderer = renderer;
    (t as unknown as { p5canvas: HTMLElement }).p5canvas = p.canvas;
    (t as unknown as { p5: typeof p }).p5 = p;
  }

  restart(): void {
    const p5inst = (this as unknown as { p5?: { remove?: () => void } }).p5;
    if (p5inst && typeof p5inst === 'object' && typeof p5inst.remove === 'function') {
      p5inst.remove();
    }
    super.restart();
  }

  destroy(): void {
    const p5inst = (this as unknown as { p5?: { remove?: () => void } }).p5;
    if (p5inst && typeof p5inst === 'object' && typeof p5inst.remove === 'function') {
      p5inst.remove();
    }
    super.destroy();
  }

  resize(): void {
    super.resize();
    const p5inst = (this as unknown as { p5?: { resizeCanvas?: (w: number, h: number) => void } }).p5;
    if (p5inst?.resizeCanvas) {
      p5inst.resizeCanvas(this.width, this.height);
    }
  }
}
