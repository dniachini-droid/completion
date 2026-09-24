/* ==========================================================================
   The painting kit's renderer. Paints one scene file to a canvas, in the
   browser: the GPU marches the rays (lib.js), then the hall's finishing is
   done on a 2D canvas exactly as the hall did it: far things go soft by
   depth, and a wide bloom lies over everything so no line-work shows.

     const out = await paint(canvas, scene, { width, height })
     out.project([x, y, z]) → [u, v] as fractions of the image (or null)
     out.anchors            → the scene's anchors, projected

   Used at bake time (bake.mjs, in a headless browser in the cloud) and by
   the kit's preview page. Never shipped in the app: the app gets the image.
   ========================================================================== */
import { LIB, MAIN } from './lib.js';

const HEAD = '#version 300 es\nprecision highp float;\nprecision highp int;\n';

/* scene defaults: the hall's own values (hall.js makeScene / render) */
const DEFAULTS = {
  cam: { x: 0, y: 1.6, z: 0, pitch: 0, yaw: 0, f: .85, cx: .5, cy: .5 },
  far: 70,
  fogK: 1 / 34,
  hazeBase: [.03, .027, .085], hazeFar: [.16, .15, .38], bloomC: [.6, .56, .9], bloomPow: 30,
  bloomAt: [0, 4.5, 66],
  ambC: [.9, .85, 1.9], amb: 1, expo: 1.7, ao: .5, wrap: .25, sheen: .22, grade: [1, 1, 1],
  glow: null,
  mist: null, beam: null,
  salt: { pink: 0 },                          /* rock salt's band edges: 0 grey and white; up to 1 pink (only where a brief says) */
  grain: 0,                                   /* close views: pick marks in cut stone within a few metres (0: the hall's long-view stone) */
  shadowJitter: 0,                            /* 1: close views, where soft shadows band: finer shadow steps */
  lights: [],
  steps: 220, stepK: .8,
  blur: { px: 2.2, d0: 9, d1: 30, k: .9 },
  bloom: { px: 16, alpha: .34 },
};

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    const lines = src.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
    throw new Error('shader: ' + log + '\n' + lines.slice(0, 200));
  }
  return s;
}

const frame = () => new Promise(r => setTimeout(r, 0));

export async function paint(canvas, sceneIn, opts = {}) {
  const S = Object.assign({}, DEFAULTS, sceneIn);
  S.cam = Object.assign({}, DEFAULTS.cam, sceneIn.cam);
  S.blur = Object.assign({}, DEFAULTS.blur, sceneIn.blur);
  S.bloom = Object.assign({}, DEFAULTS.bloom, sceneIn.bloom);
  const W = opts.width || 1320, H = opts.height || 2868;
  const scale = W / 440;                       /* the kit's sizes are in points on a 440-wide phone (16 Pro Max) */

  const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
  const gl = glc.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('no webgl2');
  if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('no float buffers');

  const vs = compile(gl, gl.VERTEX_SHADER, HEAD + 'in vec2 a; void main(){ gl_Position = vec4(a, 0, 1); }');
  const fs = compile(gl, gl.FRAGMENT_SHADER, HEAD + LIB + '\n' + S.glsl + '\n' + MAIN);
  const pg = gl.createProgram(); gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg);
  if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(pg));
  gl.useProgram(pg);

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pg, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = n => gl.getUniformLocation(pg, n);
  const c = S.cam;
  gl.uniform2f(u('uRes'), W, H);
  gl.uniform3f(u('uCam'), c.x, c.y, c.z);
  gl.uniform1f(u('uPitch'), c.pitch); gl.uniform1f(u('uYaw'), c.yaw); gl.uniform1f(u('uF'), c.f);
  gl.uniform2f(u('uC'), c.cx, c.cy);
  const L = S.lights.slice(0, 8);
  gl.uniform1i(u('uN'), L.length);
  const flat = (k, def) => L.flatMap(l => l[k] != null ? l[k] : def);
  if (L.length) {
    gl.uniform3fv(u('uLp'), flat('p', [0, 0, 0]));
    gl.uniform3fv(u('uLc'), flat('c', [1, 1, 1]));
    gl.uniform1fv(u('uLk'), L.map(l => l.k));
    gl.uniform1fv(u('uLr'), L.map(l => l.r));
    gl.uniform1fv(u('uLair'), L.map(l => l.air || 0));
    gl.uniform1fv(u('uLsh'), L.map(l => l.shadow || 0));
    gl.uniform1fv(u('uLwarm'), L.map(l => l.warm || 0));
  }
  gl.uniform1f(u('uFogK'), S.fogK); gl.uniform1f(u('uFar'), S.far);
  gl.uniform3fv(u('uHazeBase'), S.hazeBase); gl.uniform3fv(u('uHazeFar'), S.hazeFar);
  gl.uniform3fv(u('uBloomC'), S.bloomC); gl.uniform1f(u('uBloomPow'), S.bloomPow);
  const bd = [S.bloomAt[0] - c.x, S.bloomAt[1] - c.y, S.bloomAt[2] - c.z], bl = Math.hypot(...bd);
  gl.uniform3f(u('uBloomDir'), bd[0] / bl, bd[1] / bl, bd[2] / bl);
  gl.uniform3fv(u('uAmbC'), S.ambC); gl.uniform1f(u('uAmb'), S.amb);
  gl.uniform1f(u('uExpo'), S.expo); gl.uniform1f(u('uAO'), S.ao); gl.uniform1f(u('uWrap'), S.wrap); gl.uniform1f(u('uSheen'), S.sheen); gl.uniform3fv(u('uGrade'), S.grade);
  const m = S.mist;
  gl.uniform4f(u('uMist'), m ? m.y : 0, m ? m.thick : 1, m ? m.deep : 1, m ? 1 : 0);
  gl.uniform3fv(u('uMistC'), m ? m.c : [0, 0, 0]); gl.uniform3fv(u('uMistDeep'), m ? m.cDeep : [0, 0, 0]);
  const b = S.beam;
  gl.uniform4f(u('uBeam'), b ? b.x : 0, b ? b.z : 0, b ? b.r : 1, b ? b.k : 0);
  gl.uniform3fv(u('uBeamC'), b ? b.c : [0, 0, 0]); gl.uniform1f(u('uBeamTop'), b ? b.top : 0);
  gl.uniform1i(u('uSteps'), S.steps); gl.uniform1f(u('uStepK'), S.stepK);
  gl.uniform1f(u('uSaltPink'), S.salt && S.salt.pink || 0);
  gl.uniform1f(u('uGrain'), S.grain || 0);
  gl.uniform1f(u('uShJit'), S.shadowJitter || 0);

  /* paint into a float target, a strip at a time so the GPU is never held long */
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, W, H, 0, gl.RGBA, gl.FLOAT, null);
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, W, H); gl.enable(gl.SCISSOR_TEST);
  const strip = opts.strip || 64;
  for (let y = 0; y < H; y += strip) {
    gl.scissor(0, y, W, Math.min(strip, H - y));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.finish();
    if (opts.onProgress) opts.onProgress(y / H);
    await frame();
  }
  const data = new Float32Array(W * H * 4);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, data);
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  /* to 8-bit, with the hall's dither; keep the depth */
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const img = ctx.createImageData(W, H), px = img.data, depth = new Float32Array(W * H);
  const hash = (x, y) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  for (let y = 0; y < H; y++) {
    const src = (H - 1 - y) * W;                      /* GL rows run bottom-up */
    for (let x = 0; x < W; x++) {
      const i = (src + x) * 4, o = (y * W + x) * 4, di = (hash(x, y) - .5) * 2.4;
      px[o] = data[i] * 255 + di; px[o + 1] = data[i + 1] * 255 + di; px[o + 2] = data[i + 2] * 255 + di; px[o + 3] = 255;
      depth[y * W + x] = data[i + 3];
    }
  }
  ctx.putImageData(img, 0, 0);

  /* blur by depth: far things go soft (hall.js) */
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
  const tc = tmp.getContext('2d', { willReadFrequently: true });
  tc.filter = 'blur(' + (S.blur.px * scale).toFixed(1) + 'px)'; tc.drawImage(canvas, 0, 0);
  const bdat = tc.getImageData(0, 0, W, H).data, sd = ctx.getImageData(0, 0, W, H), sdd = sd.data;
  const ss = (a, b2, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b2 - a))); return t * t * (3 - 2 * t); };
  for (let i = 0, n = W * H; i < n; i++) {
    const w = ss(S.blur.d0, S.blur.d1, depth[i]) * S.blur.k; if (!w) continue;
    const q = i * 4;
    sdd[q] += (bdat[q] - sdd[q]) * w; sdd[q + 1] += (bdat[q + 1] - sdd[q + 1]) * w; sdd[q + 2] += (bdat[q + 2] - sdd[q + 2]) * w;
  }
  ctx.putImageData(sd, 0, 0);
  /* bloom: the haze glows over the stone */
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = S.bloom.alpha;
  ctx.filter = 'blur(' + (S.bloom.px * scale).toFixed(0) + 'px)'; ctx.drawImage(canvas, 0, 0); ctx.restore();
  /* glow: only what is bright bleeds into the air around it, at three sizes */
  if (S.glow) {
    const g = S.glow, bp = document.createElement('canvas'); bp.width = W; bp.height = H;
    const bx = bp.getContext('2d', { willReadFrequently: true }), src2 = ctx.getImageData(0, 0, W, H), bd2 = bx.createImageData(W, H);
    for (let i = 0; i < W * H * 4; i += 4) {
      const L = (.2126 * src2.data[i] + .7152 * src2.data[i + 1] + .0722 * src2.data[i + 2]) / 255;
      const k = Math.max(0, (L - g.threshold) / (1 - g.threshold));
      bd2.data[i] = src2.data[i] * k; bd2.data[i + 1] = src2.data[i + 1] * k; bd2.data[i + 2] = src2.data[i + 2] * k; bd2.data[i + 3] = 255;
    }
    bx.putImageData(bd2, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (const [px, a] of [[8, .5], [24, .45], [64, .4]]) { ctx.globalAlpha = a * g.k; ctx.filter = 'blur(' + (px * scale).toFixed(0) + 'px)'; ctx.drawImage(bp, 0, 0); }
    ctx.restore();
  }

  /* where things fall on the image */
  const pr = c.pitch * Math.PI / 180, yr = c.yaw * Math.PI / 180, cp = Math.cos(pr), sp = Math.sin(pr);
  const f = c.f * W;
  function project([x, y, z]) {
    let X = x - c.x, Y = y - c.y, Z = z - c.z;
    const x2 = X * Math.cos(yr) - Z * Math.sin(yr), z2 = X * Math.sin(yr) + Z * Math.cos(yr); X = x2; Z = z2;
    const yc = Y * cp - Z * sp, zc = Y * sp + Z * cp;
    if (zc < .05) return null;
    return [(c.cx * W + f * X / zc) / W, (c.cy * H - f * yc / zc) / H, zc];
  }
  const anchors = {};
  for (const [k, list] of Object.entries(S.anchors || {})) {
    anchors[k] = list.map(a => { const p = project(a.p); return p && Object.assign({}, a, { u: +p[0].toFixed(4), v: +p[1].toFixed(4), s: +(f / W / p[2]).toFixed(4) }); }).filter(Boolean);
  }
  return { project, anchors, width: W, height: H };
}
