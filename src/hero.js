import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute,
  ShaderMaterial, Points, Color, Clock, Raycaster, Plane, Vector2, Vector3,
} from 'three';

// A field of dots, like a data terrain, that rolls slowly and ripples under the pointer.
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}`;

const vertex = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uSize;
uniform vec3 uMouse;
uniform float uMouseOn;
varying float vHeat;
varying float vFade;
${noise}
void main(){
  vec3 p = position;
  float n = snoise(vec2(p.x * 0.16, p.z * 0.2 - uTime * 0.12));
  float n2 = snoise(vec2(p.x * 0.5 + uTime * 0.05, p.z * 0.5));
  p.y += n * 0.9 + n2 * 0.18;
  float d = distance(p.xz, uMouse.xz);
  float ripple = sin(d * 2.6 - uTime * 3.2) * exp(-d * 0.55) * 0.42 * uMouseOn;
  p.y += ripple + exp(-d * d * 0.35) * 0.55 * uMouseOn;
  p.y -= uScroll * 2.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (1.0 / -mv.z);
  vHeat = clamp(exp(-d * d * 0.18) * uMouseOn + smoothstep(0.55, 1.1, n) * 0.6, 0.0, 1.0);
  vFade = smoothstep(26.0, 8.0, -mv.z) * smoothstep(0.5, 3.5, -mv.z);
}`;

const fragment = /* glsl */ `
uniform vec3 uDot;
uniform vec3 uAccent;
uniform float uAlpha;
varying float vHeat;
varying float vFade;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.2, d);
  vec3 col = mix(uDot, uAccent, vHeat);
  gl_FragColor = vec4(col, a * vFade * mix(uAlpha, 1.0, vHeat));
}`;

export function initHero(canvas, { reduced }) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    canvas.style.display = 'none';
    return { setColors() {}, setScroll() {} };
  }
  const small = window.matchMedia('(max-width: 760px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 80);
  camera.position.set(0, 3.1, 9);
  camera.lookAt(0, 0, -2);

  const COLS = small ? 90 : 170;
  const ROWS = small ? 60 : 90;
  const W = 34;
  const D = 24;
  const pos = new Float32Array(COLS * ROWS * 3);
  let k = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      pos[k++] = (c / (COLS - 1) - 0.5) * W;
      pos[k++] = -1.6;
      pos[k++] = (r / (ROWS - 1)) * -D + 6;
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(pos, 3));

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uSize: { value: (small ? 34 : 40) * renderer.getPixelRatio() },
    uMouse: { value: new Vector3(0, 0, 100) },
    uMouseOn: { value: 0 },
    uDot: { value: new Color('#ecebe6') },
    uAccent: { value: new Color('#ffb020') },
    uAlpha: { value: 0.32 },
  };
  const field = new Points(geo, new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false }));
  scene.add(field);

  function layout() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  layout();
  window.addEventListener('resize', layout);

  // project the pointer onto the terrain's base plane
  const ray = new Raycaster();
  const plane = new Plane(new Vector3(0, 1, 0), 1.2);
  const ndc = new Vector2();
  const hit = new Vector3();
  const target = new Vector3(0, 0, 100);
  let mouseOn = 0;
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) { target.copy(hit); mouseOn = 1; }
  }, { passive: true });
  canvas.parentElement.addEventListener('pointerleave', () => { mouseOn = 0; });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  let scrollP = 0;
  const clock = new Clock();
  (function tick() {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    uniforms.uTime.value = reduced ? 4 : t;
    uniforms.uMouse.value.lerp(target, 0.08);
    uniforms.uMouseOn.value += (mouseOn - uniforms.uMouseOn.value) * 0.05;
    uniforms.uScroll.value += (scrollP - uniforms.uScroll.value) * 0.1;
    renderer.render(scene, camera);
  })();

  return {
    setColors(dot, accent, alpha) {
      uniforms.uDot.value.set(dot);
      uniforms.uAccent.value.set(accent);
      uniforms.uAlpha.value = alpha;
    },
    setScroll(p) { scrollP = p; },
  };
}
