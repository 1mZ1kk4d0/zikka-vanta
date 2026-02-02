import VantaBase from './_base';
import type { VantaBaseOptions } from './types/vanta';

export { VANTA } from './_base';

const win = typeof window === 'object';
let THREE: Record<string, unknown> = win ? (window as Window & { THREE?: Record<string, unknown> }).THREE ?? {} : {};

export default class ShaderBase extends VantaBase {
  declare uniforms: Record<string, { type: string; value: unknown }>;
  declare fragmentShader?: string;
  declare vertexShader?: string;
  declare valuesChanger?: () => void;

  constructor(userOptions: VantaBaseOptions & { THREE?: Record<string, unknown> }) {
    THREE = userOptions.THREE ?? THREE;
    const ColorProto = (THREE as { Color?: { prototype: { toVector?: () => unknown }; r: number; g: number; b: number } }).Color?.prototype;
    if (ColorProto && !ColorProto.toVector) {
      (ColorProto as { toVector: () => unknown }).toVector = function (this: { r: number; g: number; b: number }) {
        return new (THREE as { Vector3: new (x: number, y: number, z: number) => unknown }).Vector3(this.r, this.g, this.b);
      };
    }
    super(userOptions);
    (this as unknown as { updateUniforms: () => void }).updateUniforms = (this as unknown as { updateUniforms: () => void }).updateUniforms.bind(this);
  }

  init(): void {
    (this as unknown as { mode: string }).mode = 'shader';
    this.uniforms = {
      iTime: { type: 'f', value: 1.0 },
      iResolution: {
        type: 'v2',
        value: new (THREE as { Vector2: new (x: number, y: number) => { x: number; y: number } }).Vector2(1, 1),
      },
      iDpr: { type: 'f', value: window.devicePixelRatio || 1 },
      iMouse: {
        type: 'v2',
        value: new (THREE as { Vector2: new (x: number, y: number) => { x: number; y: number } }).Vector2(this.mouseX ?? 0, this.mouseY ?? 0),
      },
    };
    super.init();
    if (this.fragmentShader) {
      (this as unknown as { initBasicShader: (fs?: string, vs?: string) => void }).initBasicShader();
    }
  }

  setOptions(userOptions: Partial<VantaBaseOptions>): void {
    super.setOptions(userOptions);
    (this as unknown as { updateUniforms: () => void }).updateUniforms();
  }

  initBasicShader(
    fragmentShader: string = this.fragmentShader!,
    vertexShader: string | undefined = this.vertexShader
  ): void {
    if (!vertexShader) {
      vertexShader =
        'uniform float uTime;\nuniform vec2 uResolution;\nvoid main() {\n  gl_Position = vec4( position, 1.0 );\n}';
    }
    (this as unknown as { updateUniforms: () => void }).updateUniforms();
    if (typeof this.valuesChanger === 'function') {
      this.valuesChanger();
    }
    const material = new (THREE as { ShaderMaterial: new (o: object) => unknown }).ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });
    const texPath = this.options.texturePath as string | undefined;
    if (texPath) {
      const loader = new (THREE as { TextureLoader: new () => { load: (url: string) => unknown } }).TextureLoader();
      this.uniforms.iTex = { type: 't', value: loader.load(texPath) };
    }
    const mesh = new (THREE as { Mesh: new (g: unknown, m: unknown) => unknown }).Mesh(
      new (THREE as { PlaneGeometry: new (w: number, h: number) => unknown }).PlaneGeometry(2, 2),
      material
    );
    (this.scene as { add: (o: unknown) => void }).add(mesh);
    this.camera = new (THREE as { Camera: new () => unknown }).Camera() as VantaBase['camera'];
    (this.camera as { position: { z: number } }).position.z = 1;
  }

  updateUniforms(): Record<string, { type: string; value: unknown }> {
    const newUniforms: Record<string, { type: string; value: unknown }> = {};
    for (const k of Object.keys(this.options)) {
      const v = this.options[k];
      if (k.toLowerCase().indexOf('color') !== -1) {
        newUniforms[k] = {
          type: 'v3',
          value: new (THREE as { Color: new (c: unknown) => { toVector: () => unknown } }).Color(v).toVector(),
        };
      } else if (typeof v === 'number') {
        newUniforms[k] = { type: 'f', value: v };
      }
    }
    return Object.assign(this.uniforms, newUniforms);
  }

  resize(): void {
    super.resize();
    const res = this.uniforms.iResolution?.value as { x: number; y: number };
    if (res) {
      res.x = this.width / this.scale;
      res.y = this.height / this.scale;
    }
  }
}
