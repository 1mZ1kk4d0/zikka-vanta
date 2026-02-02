import VantaBase, { VANTA } from './_base';
import { rn, ri, sample, mobileCheck } from './helpers';

const win = typeof window === 'object';
let THREE = win && (window as Window & { THREE?: unknown }).THREE;

class Effect extends VantaBase {
  static initClass(): void {
    (Effect as any).prototype.defaultOptions = {
      color: 0xff8820,
      color2: 0xff8820,
      backgroundColor: 0x222222,
      size: 3,
      spacing: 35,
      showLines: true,
    };
  }

  onInit(): void {
    const TH = THREE as any;
    const camera = (this.camera = new TH.PerspectiveCamera(50, this.width / this.height, 0.1, 5000));
    camera.position.x = 0;
    camera.position.y = 250;
    camera.position.z = 50;
    camera.tx = 0;
    camera.ty = 50;
    camera.tz = 350;
    camera.lookAt(0, 0, 0);
    (this.scene as any).add(camera);

    const starsGeometry = (this as any).starsGeometry = new TH.BufferGeometry();
    let i: number, j: number, star: any, starsMaterial: any, starField: any;
    const space = this.options.spacing;
    const points: any[] = [];

    for (i = -30; i <= 30; i++) {
      for (j = -30; j <= 30; j++) {
        star = new TH.Vector3();
        star.x = i * space + space / 2;
        star.y = rn(0, 5) - 150;
        star.z = j * space + space / 2;
        points.push(star);
      }
    }
    starsGeometry.setFromPoints(points);

    starsMaterial = new TH.PointsMaterial({
      color: this.options.color,
      size: this.options.size,
    });
    starField = (this as any).starField = new TH.Points(starsGeometry, starsMaterial);
    (this.scene as any).add(starField);

    if (this.options.showLines) {
      const material = new TH.LineBasicMaterial({ color: this.options.color2 });
      const linesGeo = new TH.BufferGeometry();
      const linePoints: any[] = [];
      for (i = 0; i < 200; i++) {
        const f1 = rn(40, 60);
        const f2 = f1 + rn(12, 20);
        const z = rn(-1, 1);
        const r = Math.sqrt(1 - z * z);
        const theta = rn(0, Math.PI * 2);
        const y = Math.sin(theta) * r;
        const x = Math.cos(theta) * r;
        linePoints.push(new TH.Vector3(x * f1, y * f1, z * f1));
        linePoints.push(new TH.Vector3(x * f2, y * f2, z * f2));
      }
      linesGeo.setFromPoints(linePoints);
      (this as any).linesMesh = new TH.LineSegments(linesGeo, material);
      (this.scene as any).add((this as any).linesMesh);
    }
  }

  onUpdate(): void {
    const starsGeometry = (this as any).starsGeometry;
    const TH = THREE as any;
    for (let j = 0; j < starsGeometry.attributes.position.array.length; j += 3) {
      const x = starsGeometry.attributes.position.array[j];
      const y = starsGeometry.attributes.position.array[j + 1];
      const z = starsGeometry.attributes.position.array[j + 2];
      const newY = y + 0.1 * Math.sin(z * 0.02 + x * 0.015 + this.t! * 0.02);
      starsGeometry.attributes.position.array[j + 1] = newY;
    }
    starsGeometry.attributes.position.setUsage(TH.DynamicDrawUsage);
    starsGeometry.computeVertexNormals();
    starsGeometry.attributes.position.needsUpdate = true;

    const c = this.camera as any;
    const rate = 0.003;
    c.position.x += (c.tx - c.position.x) * rate;
    c.position.y += (c.ty - c.position.y) * rate;
    c.position.z += (c.tz - c.position.z) * rate;
    c.lookAt(0, 0, 0);

    const linesMesh = (this as any).linesMesh;
    if (linesMesh) {
      linesMesh.rotation.z += 0.002;
      linesMesh.rotation.x += 0.0008;
      linesMesh.rotation.y += 0.0005;
    }
  }

  onMouseMove(x: number, y: number): void {
    (this.camera as any).tx = (x - 0.5) * 100;
    (this.camera as any).ty = 50 + y * 50;
  }

  onRestart(): void {
    (this.scene as any).remove((this as any).starField);
  }
}
Effect.initClass();
export default VANTA.register('DOTS', Effect);
