import { mobileCheck, getBrightness } from './helpers';

declare const $: any;
declare const dat: { GUI: new (opts: object) => { domElement: HTMLElement; addColor: (obj: object, key: string, ...args: unknown[]) => unknown; add: (obj: object, key: string, ...args: unknown[]) => unknown; __controllers: { property: string; onChange: (fn: () => void) => void; onFinishChange: (fn: () => void) => void; getValue: () => unknown }[] } };
declare const rison: { encode: (o: object) => string; decode: (s: string) => object };
declare const VANTA: Record<string, (opts: object) => { destroy: () => void; options: object; name?: string; restart?: () => void; updateUniforms?: () => void; valuesChanger?: () => void; mode?: string }>;
declare const THREE: { Color: new (c: unknown) => { r: number; g: number; b: number } };

let effectName: string | null = null;
let effect: { destroy: () => void; options: object; name?: string; restart?: () => void; updateUniforms?: () => void; valuesChanger?: () => void; mode?: string; fps?: { update?: () => void } } | null = null;
let gui: ReturnType<typeof dat.GUI> | null = null;
let fps: { update?: () => void } | null = null;

const GALLERY = [
  'birds', 'fog', 'waves', 'clouds', 'clouds2', 'globe', 'net', 'cells',
  'trunk', 'topology', 'dots', 'rings', 'halo',
];

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number, immediate?: boolean): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function (this: unknown, ...args: Parameters<T>) {
    const context = this;
    const later = () => {
      timeout = undefined;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout!);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

(jQuery as unknown as { extend: (a: object, b: object) => void }).extend((jQuery as unknown as { easing: object }).easing, {
  easeInOutQuart: function (_x: number, t: number, b: number, c: number, d: number) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t + b;
    return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
  },
  easeInOutQuint: function (_x: number, t: number, b: number, c: number, d: number) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
    return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
  },
});

function loadEffect(_effectName: string, loadOptions?: Record<string, unknown>): boolean | void {
  _effectName = _effectName.toUpperCase();
  loadOptions = loadOptions || {};
  (loadOptions as Record<string, unknown>).el = 'section';
  (loadOptions as Record<string, unknown>).backgroundAlpha = 1;

  console.log('[VANTA] Loading effect: ', _effectName);
  if (typeof VANTA === 'undefined' || typeof VANTA[_effectName] !== 'function') {
    console.error('[VANTA] Effect ' + _effectName + ' not found!');
    return false;
  }

  if (effect != null) {
    effect.destroy();
  }

  (window as unknown as { effect: typeof effect }).effect = effect = VANTA[_effectName](loadOptions as object);
  effect!.name = effectName = _effectName;

  const inner = $('.wm .inner');
  inner.find('.restart').hide();
  $('.wm').removeClass('dark-text');
  $('.dg').remove();

  const options = effect!.options as Record<string, unknown>;
  (effect as { fps?: typeof fps }).fps = fps;
  gui = new dat.GUI({ autoPlace: false, width: '100%' });
  $(gui.domElement).appendTo($('.gui-cont'));
  generateCode(effect!, effectName!);
  $('body, html').animate({ scrollTop: 0 });

  if (effectName === 'WAVES') {
    gui.addColor(options, 'color');
    gui.add(options, 'shininess', 0, 150).step(1);
    gui.add(options, 'waveHeight', 0, 40).step(0.5);
    gui.add(options, 'waveSpeed', 0, 2).step(0.05);
    gui.add(options, 'zoom', 0.65, 1.75);
  } else if (effectName === 'RINGS') {
    gui.addColor(options, 'color').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'backgroundColor');
    gui.add(options, 'backgroundAlpha', 0, 1);
    inner.find('.restart').show();
  } else if (effectName === 'STRUCT') {
    gui.addColor(options, 'color').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'backgroundColor');
    inner.find('.restart').show();
  } else if (effectName === 'BIRDS') {
    gui.addColor(options, 'backgroundColor');
    gui.add(options, 'backgroundAlpha', 0, 1);
    gui.addColor(options, 'color1').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'color2').onFinishChange(() => effect!.restart?.());
    gui.add(options, 'colorMode', ['lerp', 'variance', 'lerpGradient', 'varianceGradient']).onFinishChange(() => effect!.restart?.());
    gui.add(options, 'quantity', 1, 5).step(1).onFinishChange(() => effect!.restart?.());
    gui.add(options, 'birdSize', 0.5, 4).step(0.1).onFinishChange(() => effect!.restart?.());
    gui.add(options, 'wingSpan', 10, 40).step(1).onFinishChange(() => effect!.restart?.());
    gui.add(options, 'speedLimit', 1, 10).step(1).onFinishChange(() => (effect as { valuesChanger?: () => void }).valuesChanger?.());
    gui.add(options, 'separation', 1, 100).step(1).onFinishChange(() => (effect as { valuesChanger?: () => void }).valuesChanger?.());
    gui.add(options, 'alignment', 1, 100).step(1).onFinishChange(() => (effect as { valuesChanger?: () => void }).valuesChanger?.());
    gui.add(options, 'cohesion', 1, 100).step(1).onFinishChange(() => (effect as { valuesChanger?: () => void }).valuesChanger?.());
  } else if (effectName === 'NET') {
    gui.addColor(options, 'color').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'backgroundColor');
    gui.add(options, 'points', 1, 20).step(1).onFinishChange(() => effect!.restart?.());
    gui.add(options, 'maxDistance', 10, 40).step(1);
    gui.add(options, 'spacing', 10, 20).step(1).onFinishChange(() => effect!.restart?.());
    gui.add(options, 'showDots').onFinishChange(() => effect!.restart?.());
  } else if (effectName === 'FOG') {
    gui.addColor(options, 'highlightColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.addColor(options, 'midtoneColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.addColor(options, 'lowlightColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.addColor(options, 'baseColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'blurFactor', 0.1, 0.9).step(0.01).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'zoom', 0.1, 3.0).step(0.1).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'speed', 0.0, 5.0).step(0.1);
  } else if (effectName === 'RIPPLE') {
    gui.addColor(options, 'color1').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.addColor(options, 'color2').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.addColor(options, 'backgroundColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'amplitudeFactor', 0.1, 3.0).step(0.1).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'ringFactor', 0.1, 20.0).step(0.1).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'rotationFactor', 0.0, 2.0).step(0.1).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'speed', 0.0, 5.0).step(0.1);
  } else if (effectName === 'CELLS') {
    gui.addColor(options, 'color1').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.addColor(options, 'color2').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'size', 0.2, 5.0).step(0.1).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'speed', 0.0, 5.0).step(0.1);
  } else if (effectName === 'CLOUDS') {
    gui.addColor(options, 'backgroundColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'skyColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'cloudColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'cloudShadowColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'sunColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.addColor(options, 'sunGlareColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'sunlightColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'speed', 0, 3).step(0.1).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
  } else if (effectName === 'CLOUDS2') {
    gui.addColor(options, 'backgroundColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'skyColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'cloudColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'lightColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'speed', 0.0, 5.0).step(0.1);
  } else if (effectName === 'TRUNK') {
    gui.addColor(options, 'backgroundColor').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'color').onFinishChange(() => effect!.restart?.());
    gui.add(options, 'spacing', 0, 10).step(0.5);
    gui.add(options, 'chaos', 0, 10).step(0.5);
  } else if (effectName === 'TOPOLOGY') {
    gui.addColor(options, 'backgroundColor').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'color').onFinishChange(() => effect!.restart?.());
  } else if (effectName === 'DOTS') {
    gui.addColor(options, 'backgroundColor').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'color').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'color2').onFinishChange(() => effect!.restart?.());
    gui.add(options, 'size', 0.5, 10).step(0.1).onFinishChange(() => effect!.restart?.());
    gui.add(options, 'spacing', 5, 100).step(1).onFinishChange(() => effect!.restart?.());
  } else if (effectName === 'GLOBE') {
    gui.addColor(options, 'backgroundColor').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'color').onFinishChange(() => effect!.restart?.());
    gui.addColor(options, 'color2').onFinishChange(() => effect!.restart?.());
    gui.add(options, 'size', 0.5, 2).step(0.1).onFinishChange(() => effect!.restart?.());
  } else if (effectName === 'HALO') {
    gui.addColor(options, 'backgroundColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.addColor(options, 'baseColor').onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'size', 0.1, 3).step(0.1).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'amplitudeFactor', 0, 3).step(0.1).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'xOffset', -0.5, 0.5).step(0.01).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
    gui.add(options, 'yOffset', -0.5, 0.5).step(0.01).onFinishChange(() => (effect as { updateUniforms?: () => void }).updateUniforms?.());
  }

  gui.__controllers.forEach((c) => {
    const updateBackgroundColorHelper = () => {
      if (c.property === 'backgroundColor' || c.property === 'baseColor') {
        updateBackgroundColor(c.getValue() as number);
      }
    };
    c.onChange(() => {
      generateCode(effect!, effectName!);
      updateHashDebounced();
      updateBackgroundColorHelper();
    });
    updateBackgroundColorHelper();
  });
}

function updateBackgroundColor(color: number): void {
  if (getBrightness(new THREE.Color(color)) > 0.65) {
    $('.wm').addClass('dark-text');
  } else {
    $('.wm').removeClass('dark-text');
  }
}

function generateCode(effect: { options: Record<string, unknown>; getDefaultOptions?: () => Record<string, unknown>; defaultOptions?: Record<string, unknown>; mode?: string }, effectName: string): void {
  let code: string;
  let codeStrk: string;
  const ref = effect.options;
  codeStrk = `var setVanta = ()=>{
if (window.VANTA) window.[[CODE]]
}
_strk.push(function() {
  setVanta()
  window.edit_page.Event.subscribe( "Page.beforeNewOneFadeIn", setVanta )
})`;
  code = `VANTA.${effectName}({\n`;
  code += '  el: "<strong>#your-element-selector</strong>",\n';
  for (const k of Object.keys(ref)) {
    let v = ref[k];
    let vString: string;
    if (k === 'el') continue;
    if (k === 'texturePath') {
      code += `  texturePath: "<a target='_blank' href='${v}'>${v}</a>",\n`;
      continue;
    }
    if (k.indexOf('colorMode') !== -1) {
      vString = '"' + String(v) + '"';
    } else if (k.toLowerCase().indexOf('color') !== -1) {
      vString = '0x' + Number(v).toString(16);
    } else if (typeof v === 'number') {
      vString = Number(v).toFixed(2);
    } else {
      vString = String(v);
    }
    const defaultOptions = typeof effect.getDefaultOptions === 'function' ? effect.getDefaultOptions()! : effect.defaultOptions || {};
    let shouldShowProperty = v !== (defaultOptions as Record<string, unknown>)[k];
    if (k === 'backgroundAlpha' && v === 1) shouldShowProperty = false;
    if (shouldShowProperty) {
      code += '  ' + k + ': ' + vString + ',\n';
    }
  }
  code = code.replace(/,\n$/, '\n');
  code += '})';
  codeStrk = codeStrk.replace('[[CODE]]', code).replace('#your-element-selector', '.s-page-1 .s-section-1 .s-section');

  $('.usage.applied').remove();

  let original = $('.usage-for-all .usage').first().hide();
  let clone = original.clone().addClass('applied').insertAfter(original);
  clone.html(clone.html().replace('[[CODE]]', code));
  let includeCode = ($('.usage-for-all .include-three')[0] as HTMLElement).innerHTML;
  if (effect.mode === 'p5') includeCode = ($('.usage-for-all .include-p5')[0] as HTMLElement).innerHTML;
  clone.html(clone.html().replace('[[INCLUDE]]', includeCode));
  clone.html(clone.html().replace(/\[\[EFFECTNAME\]\]/g, effectName.toLowerCase()));
  clone.show();

  original = $('.usage-for-strk .usage').first().hide();
  clone = original.clone().addClass('applied').insertAfter(original);
  clone.html(clone.html().replace('[[CODE_STRK]]', codeStrk));
  includeCode = ($('.usage-for-strk .include-three')[0] as HTMLElement).innerHTML;
  if (effect.mode === 'p5') includeCode = ($('.usage-for-strk .include-p5')[0] as HTMLElement).innerHTML;
  clone.html(clone.html().replace('[[INCLUDE]]', includeCode));
  clone.html(clone.html().replace(/\[\[EFFECTNAME\]\]/g, effectName.toLowerCase()));
  clone.show();
}

function updateHash(): void {
  const optionsToStore = $.extend({}, effect!.options) as Record<string, unknown>;
  delete optionsToStore.el;
  history.replaceState(undefined, undefined, '#' + rison.encode(optionsToStore));
}

const updateHashDebounced = debounce(updateHash, 750);

function openCloseUsage(): void {
  $('.usage-cont').slideToggle({ duration: 300, easing: 'easeInOutQuart' });
}

function loadEffectFromUrl(): void {
  const u = new URLSearchParams(document.location.search);
  const _effectName = u.get('effect') || 'birds';
  let loadOptions: object | null = null;
  if (window.location.hash.length) {
    try {
      loadOptions = rison.decode(window.location.hash.substr(1)) as object;
    } catch (err) {
      console.log('[VANTA] Invalid hash: ' + err);
    }
  }
  loadEffect(_effectName, loadOptions as Record<string, unknown> | undefined);
}

class FPS {
  filterStrength = 20;
  frameTime = 0;
  lastLoop = new Date();
  fps = 0;
  constructor() {
    const fpsOut = document.getElementById('fps');
    setInterval(() => {
      this.fps = 1000 / this.frameTime;
      if (fpsOut != null) fpsOut.innerHTML = this.fps.toFixed(1) + ' fps';
    }, 250);
  }
  update(): void {
    const thisLoop = new Date();
    const thisFrameTime = thisLoop.getTime() - this.lastLoop.getTime();
    this.frameTime += (thisFrameTime - this.frameTime) / this.filterStrength;
    this.lastLoop = thisLoop;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fps = new FPS();
  loadEffectFromUrl();
  GALLERY.forEach((_effectName) => {
    const itemTemplate = $('.item').first().hide();
    const newItem = itemTemplate.clone().show().appendTo(itemTemplate.parent());
    newItem.find('.label').text(_effectName);
    newItem.addClass(_effectName).css({ backgroundImage: `url(gallery/${_effectName}.jpg)` });
    newItem.click(function () {
      $('.item').removeClass('selected');
      $(this).addClass('selected');
      const url = '?effect=' + _effectName;
      window.history.pushState({ effect: _effectName }, '', url);
      loadEffect(_effectName);
    });
  });

  $('.customize, .usage-cont .close-btn').click(function () {
    generateCode(effect!, effectName!);
    openCloseUsage();
  });
  $('.restart').click(function () {
    effect!.restart!();
  });

  $('.strk-toggle').click(function (e) {
    e.preventDefault();
    const visible = $('.usage-for-strk').is(':visible');
    if (!visible) {
      $('.usage-for-strk, .strk-instructions').show();
      $('.usage-for-all, .all-instructions').hide();
    } else {
      $('.usage-for-strk, .strk-instructions').hide();
      $('.usage-for-all, .all-instructions').show();
    }
  });

  if ($(window).width()! > 727) {
    setTimeout(openCloseUsage, 600);
  }
  window.onpopstate = () => {
    loadEffectFromUrl();
  };
});
