import { mobileCheck, q, color2Hex, clearThree } from './helpers';
import type { VantaBaseOptions } from './types/vanta';

const win = typeof window === 'object';
let THREE: Record<string, unknown> = (win && (window as Window & { THREE?: Record<string, unknown> }).THREE) || {};
if (win && !(window as Window & { VANTA?: VantaNamespace }).VANTA) (window as Window & { VANTA?: VantaNamespace }).VANTA = {} as VantaNamespace;
const VANTA: VantaNamespace = (win && (window as Window & { VANTA?: VantaNamespace }).VANTA) || ({} as VantaNamespace);

export interface VantaNamespace {
  version: string;
  current: VantaBaseInstance | null;
  register: (name: string, Effect: new (opts: VantaBaseOptions) => VantaBaseInstance) => (opts: VantaBaseOptions) => VantaBaseInstance;
  VantaBase?: new (opts: VantaBaseOptions | HTMLElement | string) => VantaBase;
  [key: string]: unknown;
}

export interface VantaBaseInstance {
  options: VantaBaseOptions & Record<string, unknown>;
  el: HTMLElement;
  renderer?: { domElement: HTMLElement; setSize: (w: number, h: number) => void; setPixelRatio: (r: number) => void; render: (s: unknown, c: unknown) => void; setClearColor: (c: unknown, a?: number) => void };
  scene?: unknown;
  camera?: { aspect: number; updateProjectionMatrix?: () => void };
  p5renderer?: { canvas: HTMLElement };
  uniforms?: Record<string, { value: { x?: number; y?: number } | number }>;
  scale: number;
  width: number;
  height: number;
  mouseX: number;
  mouseY: number;
  mouseEaseX?: number;
  mouseEaseY?: number;
  t?: number;
  t2?: number;
  prevNow?: number;
  req?: number;
  fps?: { update?: () => void };
  windowMouseMoveWrapper: (e: MouseEvent) => void;
  windowTouchWrapper: (e: TouchEvent) => void;
  windowGyroWrapper: (e: DeviceOrientationEvent) => void;
  resize: () => void;
  animationLoop: () => number | undefined;
  restart: () => void;
  setOptions: (userOptions: Partial<VantaBaseOptions>) => void;
  destroy: () => void;
  getDefaultOptions?: () => Record<string, unknown>;
  defaultOptions?: Record<string, unknown>;
  onMouseMove?: (x: number, y: number) => void;
  onResize?: () => void;
  onUpdate?: () => void;
  onRestart?: () => void;
  onDestroy?: () => void;
  afterRender?: () => void;
}

VANTA.register = (name: string, Effect: new (opts: VantaBaseOptions) => VantaBaseInstance) => {
  return (VANTA[name] as (opts: VantaBaseOptions) => VantaBaseInstance) = (opts) => new Effect(opts);
};
VANTA.version = '0.5.24';

export { VANTA };

const error = (...args: unknown[]): void => {
  console.error('[VANTA]', ...args);
};

export default class VantaBase {
  options!: (VantaBaseOptions & Record<string, unknown>) & { el: HTMLElement | string };
  el!: HTMLElement;
  renderer?: VantaBaseInstance['renderer'];
  scene?: unknown;
  camera?: VantaBaseInstance['camera'];
  p5renderer?: { canvas: HTMLElement };
  uniforms?: VantaBaseInstance['uniforms'];
  scale!: number;
  width!: number;
  height!: number;
  mouseX!: number;
  mouseY!: number;
  mouseEaseX?: number;
  mouseEaseY?: number;
  t?: number;
  t2?: number;
  prevNow?: number;
  req?: number;
  fps?: { update?: () => void };

  constructor(userOptions: VantaBaseOptions | HTMLElement | string = {}) {
    if (!win) return undefined!;
    (VANTA as VantaNamespace).current = this;
    this.windowMouseMoveWrapper = this.windowMouseMoveWrapper.bind(this);
    this.windowTouchWrapper = this.windowTouchWrapper.bind(this);
    this.windowGyroWrapper = this.windowGyroWrapper.bind(this);
    this.resize = this.resize.bind(this);
    this.animationLoop = this.animationLoop.bind(this);
    this.restart = this.restart.bind(this);

    const defaultOptions =
      typeof (this as unknown as { getDefaultOptions?: () => Record<string, unknown> }).getDefaultOptions === 'function'
        ? (this as unknown as { getDefaultOptions: () => Record<string, unknown> }).getDefaultOptions()
        : (this as unknown as { defaultOptions?: Record<string, unknown> }).defaultOptions;
    this.options = Object.assign(
      {
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
      },
      defaultOptions || {}
    ) as VantaBaseInstance['options'];

    let opts = userOptions as VantaBaseOptions & { el?: HTMLElement | string };
    if (userOptions instanceof HTMLElement || typeof userOptions === 'string') {
      opts = { el: userOptions };
    }
    Object.assign(this.options, opts);

    if (this.options.THREE) {
      THREE = this.options.THREE as Record<string, unknown>;
    }

    this.el = this.options.el as HTMLElement;
    if (this.el == null) {
      error('Instance needs "el" param!');
      return undefined!;
    }
    if (!(this.options.el instanceof HTMLElement)) {
      const selector = this.el as unknown as string;
      this.el = q(selector) as HTMLElement;
      if (!this.el) {
        error('Cannot find element', selector);
        return undefined!;
      }
    }

    this.prepareEl();
    this.initThree();
    this.setSize();

    try {
      (this as unknown as { init: () => void }).init();
    } catch (e) {
      error('Init error', e);
      if (this.renderer?.domElement) {
        this.el.removeChild(this.renderer.domElement);
      }
      if (this.options.backgroundColor) {
        console.log('[VANTA] Falling back to backgroundColor');
        this.el.style.background = color2Hex(this.options.backgroundColor as number | string);
      }
      return undefined!;
    }

    this.initMouse();
    this.resize();
    this.animationLoop();

    const ad = window.addEventListener.bind(window);
    ad('resize', this.resize);
    window.requestAnimationFrame(this.resize);

    if (this.options.mouseControls) {
      ad('scroll', this.windowMouseMoveWrapper);
      ad('mousemove', this.windowMouseMoveWrapper);
    }
    if (this.options.touchControls) {
      ad('touchstart', this.windowTouchWrapper);
      ad('touchmove', this.windowTouchWrapper);
    }
    if (this.options.gyroControls) {
      ad('deviceorientation', this.windowGyroWrapper as EventListener);
    }
  }

  setOptions(userOptions: Partial<VantaBaseOptions> = {}): void {
    Object.assign(this.options, userOptions);
    this.triggerMouseMove();
  }

  prepareEl(): void {
    let i: number;
    let child: Element;
    if (typeof Node !== 'undefined' && Node.TEXT_NODE) {
      for (i = 0; i < this.el.childNodes.length; i++) {
        const n = this.el.childNodes[i];
        if (n.nodeType === Node.TEXT_NODE) {
          const s = document.createElement('span');
          s.textContent = n.textContent;
          n.parentElement!.insertBefore(s, n);
          n.remove();
        }
      }
    }
    for (i = 0; i < this.el.children.length; i++) {
      child = this.el.children[i];
      if (getComputedStyle(child).position === 'static') {
        (child as HTMLElement).style.position = 'relative';
      }
      if (getComputedStyle(child).zIndex === 'auto') {
        (child as HTMLElement).style.zIndex = '1';
      }
    }
    if (getComputedStyle(this.el).position === 'static') {
      this.el.style.position = 'relative';
    }
  }

  applyCanvasStyles(canvasEl: HTMLElement, opts: Record<string, string | number> = {}): void {
    Object.assign(canvasEl.style, {
      position: 'absolute',
      zIndex: 0,
      top: 0,
      left: 0,
      background: '',
    });
    if (this.options.pixelated) {
      canvasEl.style.imageRendering = 'pixelated';
    }
    Object.assign(canvasEl.style, opts);
    canvasEl.classList.add('vanta-canvas');
  }

  initThree(): void {
    if (!(THREE as { WebGLRenderer?: unknown }).WebGLRenderer) {
      console.warn('[VANTA] No THREE defined on window');
      return;
    }
    this.renderer = new (THREE as { WebGLRenderer: new (o: object) => VantaBaseInstance['renderer'] }).WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.el.appendChild(this.renderer.domElement);
    this.applyCanvasStyles(this.renderer.domElement);
    if (isNaN(this.options.backgroundAlpha as number)) {
      this.options.backgroundAlpha = 1;
    }
    this.scene = new (THREE as { Scene: new () => unknown }).Scene();
  }

  getCanvasElement(): HTMLElement | undefined {
    if (this.renderer) return this.renderer.domElement;
    if (this.p5renderer) return this.p5renderer.canvas;
    return undefined;
  }

  getCanvasRect(): DOMRect | false {
    const canvas = this.getCanvasElement();
    if (!canvas) return false;
    return canvas.getBoundingClientRect();
  }

  windowMouseMoveWrapper(e: MouseEvent): void {
    const rect = this.getCanvasRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      this.mouseX = x;
      this.mouseY = y;
      if (!this.options.mouseEase) this.triggerMouseMove(x, y);
    }
  }

  windowTouchWrapper(e: TouchEvent): void {
    const rect = this.getCanvasRect();
    if (!rect) return;
    if (e.touches.length === 1) {
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        this.mouseX = x;
        this.mouseY = y;
        if (!this.options.mouseEase) this.triggerMouseMove(x, y);
      }
    }
  }

  windowGyroWrapper(e: DeviceOrientationEvent): void {
    const rect = this.getCanvasRect();
    if (!rect) return;
    const x = Math.round((e.alpha ?? 0) * 2) - rect.left;
    const y = Math.round((e.beta ?? 0) * 2) - rect.top;
    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      this.mouseX = x;
      this.mouseY = y;
      if (!this.options.mouseEase) this.triggerMouseMove(x, y);
    }
  }

  triggerMouseMove(x?: number, y?: number): void {
    if (x === undefined && y === undefined) {
      if (this.options.mouseEase) {
        x = this.mouseEaseX ?? 0;
        y = this.mouseEaseY ?? 0;
      } else {
        x = this.mouseX;
        y = this.mouseY;
      }
    }
    if (this.uniforms?.iMouse?.value && typeof this.uniforms.iMouse.value === 'object') {
      this.uniforms.iMouse.value.x = (x ?? 0) / this.scale;
      this.uniforms.iMouse.value.y = (y ?? 0) / this.scale;
    }
    const xNorm = (x ?? 0) / this.width;
    const yNorm = (y ?? 0) / this.height;
    if (typeof (this as unknown as { onMouseMove?: (x: number, y: number) => void }).onMouseMove === 'function') {
      (this as unknown as { onMouseMove: (x: number, y: number) => void }).onMouseMove(xNorm, yNorm);
    }
  }

  setSize(): void {
    this.scale = this.scale || 1;
    if (mobileCheck() && this.options.scaleMobile) {
      this.scale = this.options.scaleMobile as number;
    } else if (this.options.scale) {
      this.scale = this.options.scale as number;
    }
    this.width = Math.max(this.el.offsetWidth, (this.options.minWidth as number) ?? 200);
    this.height = Math.max(this.el.offsetHeight, (this.options.minHeight as number) ?? 200);
  }

  initMouse(): void {
    const minW = (this.options.minWidth as number) ?? 200;
    const minH = (this.options.minHeight as number) ?? 200;
    if (
      (this.mouseX == null && this.mouseY == null) ||
      (this.mouseX === minW / 2 && this.mouseY === minH / 2)
    ) {
      this.mouseX = this.width / 2;
      this.mouseY = this.height / 2;
      this.triggerMouseMove(this.mouseX, this.mouseY);
    }
  }

  resize(): void {
    this.setSize();
    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      if (typeof this.camera.updateProjectionMatrix === 'function') {
        this.camera.updateProjectionMatrix();
      }
    }
    if (this.renderer) {
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(window.devicePixelRatio / this.scale);
    }
    if (typeof (this as unknown as { onResize?: () => void }).onResize === 'function') {
      (this as unknown as { onResize: () => void }).onResize();
    }
  }

  isOnScreen(): boolean {
    const elHeight = this.el.offsetHeight;
    const elRect = this.el.getBoundingClientRect();
    const scrollTop =
      window.pageYOffset ??
      (document.documentElement || (document.body.parentNode as Element) || document.body).scrollTop;
    const offsetTop = elRect.top + scrollTop;
    const minScrollTop = offsetTop - window.innerHeight;
    const maxScrollTop = offsetTop + elHeight;
    return minScrollTop <= scrollTop && scrollTop <= maxScrollTop;
  }

  animationLoop(): number | undefined {
    this.t = this.t ?? 0;
    this.t2 = this.t2 ?? 0;
    const now = performance.now();
    if (this.prevNow) {
      let elapsedTime = (now - this.prevNow) / (1000 / 60);
      elapsedTime = Math.max(0.2, Math.min(elapsedTime, 5));
      this.t += elapsedTime;
      this.t2 += ((this.options.speed as number) || 1) * elapsedTime;
      if (this.uniforms?.iTime?.value !== undefined) {
        this.uniforms.iTime.value = this.t2 * 0.016667;
      }
    }
    this.prevNow = now;

    if (this.options.mouseEase) {
      this.mouseEaseX = this.mouseEaseX ?? this.mouseX ?? 0;
      this.mouseEaseY = this.mouseEaseY ?? this.mouseY ?? 0;
      if (
        Math.abs(this.mouseEaseX - this.mouseX) + Math.abs(this.mouseEaseY - this.mouseY) > 0.1
      ) {
        this.mouseEaseX += (this.mouseX - this.mouseEaseX) * 0.05;
        this.mouseEaseY += (this.mouseY - this.mouseEaseY) * 0.05;
        this.triggerMouseMove(this.mouseEaseX, this.mouseEaseY);
      }
    }

    if (this.isOnScreen() || this.options.forceAnimate) {
      if (typeof (this as unknown as { onUpdate?: () => void }).onUpdate === 'function') {
        (this as unknown as { onUpdate: () => void }).onUpdate();
      }
      if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera);
        this.renderer.setClearColor(this.options.backgroundColor, this.options.backgroundAlpha as number);
      }
      if (this.fps?.update) this.fps.update();
      if (typeof (this as unknown as { afterRender?: () => void }).afterRender === 'function') {
        (this as unknown as { afterRender: () => void }).afterRender();
      }
    }
    return (this.req = window.requestAnimationFrame(this.animationLoop.bind(this)));
  }

  restart(): void {
    if (this.scene && (this.scene as { children: { length: number; [i: number]: unknown }; remove: (c: unknown) => void }).children) {
      const scene = this.scene as { children: unknown[]; remove: (c: unknown) => void };
      while (scene.children.length) {
        scene.remove(scene.children[0]);
      }
    }
    if (typeof (this as unknown as { onRestart?: () => void }).onRestart === 'function') {
      (this as unknown as { onRestart: () => void }).onRestart();
    }
    (this as unknown as { init: () => void }).init();
  }

  init(): void {
    if (typeof (this as unknown as { onInit?: () => void }).onInit === 'function') {
      (this as unknown as { onInit: () => void }).onInit();
    }
  }

  destroy(): void {
    if (typeof (this as unknown as { onDestroy?: () => void }).onDestroy === 'function') {
      (this as unknown as { onDestroy: () => void }).onDestroy();
    }
    const rm = window.removeEventListener.bind(window);
    rm('touchstart', this.windowTouchWrapper);
    rm('touchmove', this.windowTouchWrapper);
    rm('scroll', this.windowMouseMoveWrapper);
    rm('mousemove', this.windowMouseMoveWrapper);
    rm('deviceorientation', this.windowGyroWrapper as EventListener);
    rm('resize', this.resize);
    if (this.req != null) window.cancelAnimationFrame(this.req);

    const scene = this.scene as Parameters<typeof clearThree>[0] | undefined;
    if (scene?.children) {
      clearThree(scene);
    }
    if (this.renderer) {
      if (this.renderer.domElement?.parentNode) {
        this.el.removeChild(this.renderer.domElement);
      }
      this.renderer = undefined;
      this.scene = undefined;
    }
    if (VANTA.current === this) {
      VANTA.current = null;
    }
  }
}

(VANTA as VantaNamespace).VantaBase = VantaBase;
