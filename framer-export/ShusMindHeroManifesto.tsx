/**
 * Shu's Mind — Hero + Manifesto + Index Sidebar, ported for Framer.
 * ------------------------------------------------------------------
 * Single self-contained file. No Tailwind, no next/font, no "@/..."
 * path aliases, no external stylesheet — every visual is either an
 * inline `style` object or a value computed in JS each animation
 * frame and written directly to `element.style`.
 *
 * HOW TO USE IN FRAMER
 * 1. Create a new Code File (or Code Component) and paste this whole
 *    file in. Framer resolves npm imports itself, so keep the three
 *    imports below (framer-motion, gsap, gsap/ScrollTrigger, ogl) —
 *    don't try to strip them.
 * 2. ⚠️ `ogl` (the WebGL library the Prism background uses) is a
 *    smaller/less common package. Test that this import resolves in
 *    Framer FIRST, before investing time wiring the rest up — if
 *    Framer can't fetch it, the Prism background is the one piece
 *    you'd need to swap for something else (e.g. a CSS gradient).
 * 3. Render `<ShusMindHeroManifesto />` on a page. It fills its own
 *    height (Hero = 100svh, Manifesto = 100svh min) — don't nest it
 *    inside a fixed-height frame.
 * 4. Fonts (JetBrains Mono / Space Grotesk / DM Sans) are loaded from
 *    Google Fonts via a <link> tag injected on mount. If Framer's own
 *    font picker is preferred, delete `useGoogleFonts()` and swap the
 *    FONT_* constants for Framer's font tokens instead.
 * 5. The index sidebar only renders at viewport width >= 1024px, and
 *    the floating word field / light points only at >= 640px — same
 *    breakpoints as the original Tailwind version, just re-implemented
 *    with a `useViewportWidth()` resize hook since there's no
 *    Tailwind responsive-variant system here.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Renderer, Triangle, Program, Mesh } from "ogl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ============================================================== *
 * Design tokens (mirrors the original globals.css custom properties)
 * ============================================================== */

const COLORS = {
  ink: "#050505",
  paper: "#f3f1ea",
  paperDim: "#a8a6a0",
  paperFaint: "#59584f",
  emerald: "#10b981",
  gold: "#eab308",
  blue: "#4d85d7",
  terracotta: "#d0634d",
};

const EASE = {
  prism: [0.16, 1, 0.3, 1] as const,
  refract: [0.22, 1, 0.36, 1] as const,
  drift: [0.65, 0, 0.35, 1] as const,
  settle: [0.33, 1, 0.68, 1] as const,
};

const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";
const FONT_GROTESK = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const FONT_SANS = "'DM Sans', ui-sans-serif, system-ui, sans-serif";

const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/* ============================================================== *
 * Small shared helpers
 * ============================================================== */

function useGoogleFonts() {
  useEffect(() => {
    const id = "shus-mind-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500&family=DM+Sans:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  useEffect(() => {
    function onResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [255, 255, 255];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

type PointerState = { x: number; y: number; active: boolean };

/** Tracks pointer position relative to a container in a plain ref (no
 *  React state) so consumers can read it inside their own rAF loops. */
function usePointer(containerRef: RefObject<HTMLElement | null>) {
  const pointerRef = useRef<PointerState>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
      pointerRef.current.active = true;
    }
    function onLeave() {
      pointerRef.current.active = false;
    }

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerdown", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef]);

  return pointerRef;
}

/* ============================================================== *
 * Floating-word field data
 * ============================================================== */

type DepthLayer = "d1" | "d2" | "d3" | "d4";

const LAYERS: Record<
  DepthLayer,
  { fontSize: string; blur: number; opacity: number; parallax: number }
> = {
  d1: { fontSize: "clamp(2.75rem, 4.5vw, 4.25rem)", blur: 1, opacity: 0.95, parallax: 0.08 },
  d2: { fontSize: "clamp(2rem, 3vw, 2.9rem)", blur: 1.5, opacity: 0.85, parallax: 0.06 },
  d3: { fontSize: "clamp(1.2rem, 1.9vw, 1.8rem)", blur: 2, opacity: 0.65, parallax: 0.04 },
  d4: { fontSize: "clamp(0.85rem, 1.3vw, 1.15rem)", blur: 2.5, opacity: 0.5, parallax: 0.02 },
};

type Fragment = {
  id: string;
  text: string;
  top: string;
  left: string;
  layer: DepthLayer;
  delay: number;
  floatDuration: number;
};

const FRAGMENTS: Fragment[] = [
  { id: "culture", text: "Culture", top: "57%", left: "56%", layer: "d1", delay: 0.1, floatDuration: 8 },
  { id: "ai", text: "AI", top: "78%", left: "67%", layer: "d1", delay: 0.45, floatDuration: 7 },
  { id: "human", text: "Human", top: "30%", left: "45%", layer: "d2", delay: 0.25, floatDuration: 9 },
  { id: "intelligence", text: "Intelligence", top: "30%", left: "73%", layer: "d2", delay: 0.6, floatDuration: 8.5 },
  { id: "history", text: "History", top: "63%", left: "83%", layer: "d2", delay: 0.35, floatDuration: 7.5 },
  { id: "emotion", text: "Emotion", top: "44%", left: "83%", layer: "d3", delay: 0.15, floatDuration: 8 },
  { id: "places", text: "Places", top: "73%", left: "40%", layer: "d3", delay: 0.5, floatDuration: 9 },
  { id: "memory", text: "Memory", top: "16%", left: "88%", layer: "d3", delay: 0.3, floatDuration: 7 },
  { id: "connection", text: "Connection", top: "72%", left: "24%", layer: "d3", delay: 0.7, floatDuration: 8.5 },
  { id: "meaning", text: "Meaning", top: "12%", left: "58%", layer: "d4", delay: 0.2, floatDuration: 6.5 },
  { id: "care", text: "Care", top: "22%", left: "14%", layer: "d4", delay: 0.55, floatDuration: 7 },
  { id: "signals", text: "Signals", top: "46%", left: "35%", layer: "d4", delay: 0.4, floatDuration: 6 },
  { id: "behavior", text: "Behavior", top: "93%", left: "84%", layer: "d4", delay: 0.65, floatDuration: 7.5 },
  { id: "philosophy", text: "Philosophy", top: "90%", left: "26%", layer: "d4", delay: 0.05, floatDuration: 6.5 },
];

type LightPoint = {
  id: string;
  top: string;
  left: string;
  size: number;
  hue: "emerald" | "gold";
  delay: number;
  duration: number;
};

const LIGHT_POINTS: LightPoint[] = Array.from({ length: 18 }).map((_, i) => {
  const hue: "emerald" | "gold" = i % 2 === 0 ? "emerald" : "gold";
  const top = (i * 53.7) % 96;
  const left = (i * 31.3 + i * i * 2.1) % 96;
  return {
    id: `pt-${i}`,
    top: `${top}%`,
    left: `${left}%`,
    size: 2 + ((i * 7) % 4),
    hue,
    delay: (i % 6) * 0.35,
    duration: 4 + (i % 5),
  };
});

/* ============================================================== *
 * Prism — WebGL background (ogl). Logic is unchanged from the
 * original; only the container's styling moved to inline style.
 * ============================================================== */

type PrismProps = {
  height?: number;
  baseWidth?: number;
  animationType?: "rotate" | "hover" | "3drotate";
  glow?: number;
  offset?: { x?: number; y?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
};

function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = "rotate",
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5,
}: PrismProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetX = offset?.x ?? 0;
  const offsetY = offset?.y ?? 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const H = Math.max(0.001, height);
    const BW = Math.max(0.001, baseWidth);
    const BASE_HALF = BW * 0.5;
    const GLOW = Math.max(0.0, glow);
    const NOISE = Math.max(0.0, noise);
    const offX = offsetX;
    const offY = offsetY;
    const SAT = transparent ? 1.5 : 1;
    const SCALE = Math.max(0.001, scale);
    const HUE = hueShift || 0;
    const CFREQ = Math.max(0.0, colorFrequency || 1);
    const BLOOM = Math.max(0.0, bloom || 1);
    const RSX = 1;
    const RSY = 1;
    const RSZ = 1;
    const TS = Math.max(0, timeScale || 1);
    const HOVSTR = Math.max(0, hoverStrength || 1);
    const INERT = Math.max(0, Math.min(1, inertia || 0.12));

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new Renderer({
      dpr,
      alpha: transparent,
      antialias: false,
    });
    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    Object.assign(gl.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });
    container.appendChild(gl.canvas);

    const vertex = /* glsl */ `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = /* glsl */ `
      precision highp float;

      uniform vec2  iResolution;
      uniform float iTime;

      uniform float uHeight;
      uniform float uBaseHalf;
      uniform mat3  uRot;
      uniform int   uUseBaseWobble;
      uniform float uGlow;
      uniform vec2  uOffsetPx;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uScale;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;

      vec4 tanh4(vec4 x){
        vec4 e2x = exp(2.0*x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float rand(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float sdOctaAnisoInv(vec3 p){
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }

      float sdPyramidUpInv(vec3 p){
        float oct = sdOctaAnisoInv(p);
        float halfSpace = -p.y;
        return max(oct, halfSpace);
      }

      mat3 hueRotation(float a){
        float c = cos(a), s = sin(a);
        mat3 W = mat3(
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114
        );
        mat3 U = mat3(
           0.701, -0.587, -0.114,
          -0.299,  0.413, -0.114,
          -0.300, -0.588,  0.886
        );
        mat3 V = mat3(
           0.168, -0.331,  0.500,
           0.328,  0.035, -0.500,
          -0.497,  0.296,  0.201
        );
        return W + U * c + V * s;
      }

      void main(){
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

        float z = 5.0;
        float d = 0.0;

        vec3 p;
        vec4 o = vec4(0.0);

        float centerShift = uCenterShift;
        float cf = uColorFreq;

        mat2 wob = mat2(1.0);
        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t + 0.0);
          float c1 = cos(t + 33.0);
          float c2 = cos(t + 11.0);
          wob = mat2(c0, c1, c2, c0);
        }

        const int STEPS = 100;
        for (int i = 0; i < STEPS; i++) {
          p = vec3(f, z);
          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          q.y += centerShift;
          d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
          z -= d;
          o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
        }

        o = tanh4(o * o * (uGlow * uBloom) / 1e5);

        vec3 col = o.rgb;
        float n = rand(gl_FragCoord.xy + vec2(iTime));
        col += (n - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);

        float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

        if(abs(uHueShift) > 0.0001){
          col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        }

        gl_FragColor = vec4(col, o.a);
      }
    `;

    const geometry = new Triangle(gl);
    const iResBuf = new Float32Array(2);
    const offsetPxBuf = new Float32Array(2);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: iResBuf },
        iTime: { value: 0 },
        uHeight: { value: H },
        uBaseHalf: { value: BASE_HALF },
        uUseBaseWobble: { value: 1 },
        uRot: { value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) },
        uGlow: { value: GLOW },
        uOffsetPx: { value: offsetPxBuf },
        uNoise: { value: NOISE },
        uSaturation: { value: SAT },
        uScale: { value: SCALE },
        uHueShift: { value: HUE },
        uColorFreq: { value: CFREQ },
        uBloom: { value: BLOOM },
        uCenterShift: { value: H * 0.25 },
        uInvBaseHalf: { value: 1 / BASE_HALF },
        uInvHeight: { value: 1 / H },
        uMinAxis: { value: Math.min(BASE_HALF, H) },
        uPxScale: {
          value: 1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE),
        },
        uTimeScale: { value: TS },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      iResBuf[0] = gl.drawingBufferWidth;
      iResBuf[1] = gl.drawingBufferHeight;
      offsetPxBuf[0] = offX * dpr;
      offsetPxBuf[1] = offY * dpr;
      program.uniforms.uPxScale.value =
        1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const rotBuf = new Float32Array(9);
    const setMat3FromEuler = (
      yawY: number,
      pitchX: number,
      rollZ: number,
      out: Float32Array
    ) => {
      const cy = Math.cos(yawY),
        sy = Math.sin(yawY);
      const cx = Math.cos(pitchX),
        sx = Math.sin(pitchX);
      const cz = Math.cos(rollZ),
        sz = Math.sin(rollZ);
      const r00 = cy * cz + sy * sx * sz;
      const r01 = -cy * sz + sy * sx * cz;
      const r02 = sy * cx;

      const r10 = cx * sz;
      const r11 = cx * cz;
      const r12 = -sx;

      const r20 = -sy * cz + cy * sx * sz;
      const r21 = sy * sz + cy * sx * cz;
      const r22 = cy * cx;

      out[0] = r00;
      out[1] = r10;
      out[2] = r20;
      out[3] = r01;
      out[4] = r11;
      out[5] = r21;
      out[6] = r02;
      out[7] = r12;
      out[8] = r22;
      return out;
    };

    const NOISE_IS_ZERO = NOISE < 1e-6;
    let raf = 0;
    const t0 = performance.now();
    const startRAF = () => {
      if (raf) return;
      raf = requestAnimationFrame(render);
    };
    const stopRAF = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const rnd = () => Math.random();
    const wX = (0.3 + rnd() * 0.6) * RSX;
    const wY = (0.2 + rnd() * 0.7) * RSY;
    const wZ = (0.1 + rnd() * 0.5) * RSZ;
    const phX = rnd() * Math.PI * 2;
    const phZ = rnd() * Math.PI * 2;

    let yaw = 0,
      pitch = 0,
      roll = 0;
    let targetYaw = 0,
      targetPitch = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const pointer = { x: 0, y: 0, inside: true };
    const onMove = (e: PointerEvent) => {
      const ww = Math.max(1, window.innerWidth);
      const wh = Math.max(1, window.innerHeight);
      const cx = ww * 0.5;
      const cy = wh * 0.5;
      const nx = (e.clientX - cx) / (ww * 0.5);
      const ny = (e.clientY - cy) / (wh * 0.5);
      pointer.x = Math.max(-1, Math.min(1, nx));
      pointer.y = Math.max(-1, Math.min(1, ny));
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    const onBlur = () => {
      pointer.inside = false;
    };

    let onPointerMove: ((e: PointerEvent) => void) | null = null;
    if (animationType === "hover") {
      onPointerMove = (e) => {
        onMove(e);
        startRAF();
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
      window.addEventListener("blur", onBlur);
      program.uniforms.uUseBaseWobble.value = 0;
    } else if (animationType === "3drotate") {
      program.uniforms.uUseBaseWobble.value = 0;
    } else {
      program.uniforms.uUseBaseWobble.value = 1;
    }

    const render = (t: number) => {
      const time = (t - t0) * 0.001;
      program.uniforms.iTime.value = time;

      let continueRAF = true;

      if (animationType === "hover") {
        const maxPitch = 0.6 * HOVSTR;
        const maxYaw = 0.6 * HOVSTR;
        targetYaw = (pointer.inside ? -pointer.x : 0) * maxYaw;
        targetPitch = (pointer.inside ? pointer.y : 0) * maxPitch;
        const prevYaw = yaw;
        const prevPitch = pitch;
        const prevRoll = roll;
        yaw = lerp(prevYaw, targetYaw, INERT);
        pitch = lerp(prevPitch, targetPitch, INERT);
        roll = lerp(prevRoll, 0, 0.1);
        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);

        if (NOISE_IS_ZERO) {
          const settled =
            Math.abs(yaw - targetYaw) < 1e-4 &&
            Math.abs(pitch - targetPitch) < 1e-4 &&
            Math.abs(roll) < 1e-4;
          if (settled) continueRAF = false;
        }
      } else if (animationType === "3drotate") {
        const tScaled = time * TS;
        yaw = tScaled * wY;
        pitch = Math.sin(tScaled * wX + phX) * 0.6;
        roll = Math.sin(tScaled * wZ + phZ) * 0.5;
        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
        if (TS < 1e-6) continueRAF = false;
      } else {
        rotBuf[0] = 1;
        rotBuf[1] = 0;
        rotBuf[2] = 0;
        rotBuf[3] = 0;
        rotBuf[4] = 1;
        rotBuf[5] = 0;
        rotBuf[6] = 0;
        rotBuf[7] = 0;
        rotBuf[8] = 1;
        program.uniforms.uRot.value = rotBuf;
        if (TS < 1e-6) continueRAF = false;
      }

      renderer.render({ scene: mesh });
      if (continueRAF) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    let io: IntersectionObserver | null = null;
    if (suspendWhenOffscreen) {
      io = new IntersectionObserver((entries) => {
        const vis = entries.some((e) => e.isIntersecting);
        if (vis) startRAF();
        else stopRAF();
      });
      io.observe(container);
      startRAF();
    } else {
      startRAF();
    }

    return () => {
      stopRAF();
      ro.disconnect();
      if (animationType === "hover") {
        if (onPointerMove)
          window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("blur", onBlur);
      }
      io?.disconnect();
      if (gl.canvas.parentElement === container)
        container.removeChild(gl.canvas);
    };
  }, [
    height,
    baseWidth,
    animationType,
    glow,
    noise,
    offsetX,
    offsetY,
    scale,
    transparent,
    hueShift,
    colorFrequency,
    timeScale,
    hoverStrength,
    inertia,
    bloom,
    suspendWhenOffscreen,
  ]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    />
  );
}

/* ============================================================== *
 * Light points — small pulsing dots scattered behind the words
 * ============================================================== */

function PulsingDot({
  size,
  hue,
  delay,
  duration,
}: {
  size: number;
  hue: "emerald" | "gold";
  delay: number;
  duration: number;
}) {
  const color = hue === "emerald" ? COLORS.emerald : COLORS.gold;
  return (
    <motion.span
      style={{
        display: "block",
        borderRadius: 9999,
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0.2, 0.8] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function LightPoints({ viewportWidth }: { viewportWidth: number }) {
  if (viewportWidth < 640) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 15,
        pointerEvents: "none",
      }}
    >
      {LIGHT_POINTS.map((p) => (
        <span
          key={p.id}
          className="frag-point"
          style={{ position: "absolute", top: p.top, left: p.left }}
        >
          <PulsingDot
            size={p.size}
            hue={p.hue}
            delay={p.delay}
            duration={p.duration}
          />
        </span>
      ))}
    </div>
  );
}

/* ============================================================== *
 * Floating words — depth-layered, parallax + cursor-proximity focus
 * ============================================================== */

const FOCUS_PADDING = 56; // px reach beyond a word's own box

function FloatingWords({
  pointerRef,
  sectionRef,
  viewportWidth,
}: {
  pointerRef: RefObject<PointerState>;
  sectionRef: RefObject<HTMLElement | null>;
  viewportWidth: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef(new Map<string, HTMLDivElement>());
  const nodeRefs = useRef(new Map<string, HTMLSpanElement>());
  const par = useRef({ x: 0, y: 0 });
  const focusCurrent = useRef(new Map<string, number>());

  useEffect(() => {
    let raf = 0;

    function frame() {
      const section = sectionRef.current;
      if (!section) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const sectionRect = section.getBoundingClientRect();
      const pointer = pointerRef.current;

      const targetX = pointer.active ? pointer.x - sectionRect.width / 2 : 0;
      const targetY = pointer.active ? pointer.y - sectionRect.height / 2 : 0;
      par.current.x += (targetX - par.current.x) * 0.08;
      par.current.y += (targetY - par.current.y) * 0.08;

      FRAGMENTS.forEach((f) => {
        const wrap = wrapRefs.current.get(f.id);
        const node = nodeRefs.current.get(f.id);
        if (!wrap || !node) return;
        const L = LAYERS[f.layer];

        const dx = par.current.x * L.parallax;
        const dy = par.current.y * L.parallax;
        wrap.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px))`;

        let target = 0;
        if (pointer.active) {
          const rect = node.getBoundingClientRect();
          const cx = rect.left - sectionRect.left + rect.width / 2;
          const cy = rect.top - sectionRect.top + rect.height / 2;
          const dist = Math.hypot(cx - pointer.x, cy - pointer.y);
          const radius = rect.width / 2 + FOCUS_PADDING;
          target = dist < radius ? 1 : 0;
        }
        const cur = focusCurrent.current.get(f.id) ?? 0;
        const next = cur + (target - cur) * 0.18;
        focusCurrent.current.set(f.id, next);

        const opacity = L.opacity + (1 - L.opacity) * next;
        const blur = L.blur * (1 - next);
        const scale = 1 + 0.08 * next;

        node.style.opacity = String(opacity);
        node.style.filter = blur > 0.01 ? `blur(${blur}px)` : "none";
        node.style.transform = `scale(${scale})`;
        node.style.color = lerpColor(COLORS.paper, "#ffffff", next);
      });

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pointerRef, sectionRef]);

  if (viewportWidth < 640) return null;

  return (
    <div
      ref={rootRef}
      style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}
    >
      {FRAGMENTS.map((f, i) => {
        const L = LAYERS[f.layer];
        return (
          <div
            key={f.id}
            ref={(el) => {
              if (el) wrapRefs.current.set(f.id, el);
              else wrapRefs.current.delete(f.id);
            }}
            className="frag"
            style={{
              position: "absolute",
              top: f.top,
              left: f.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.4 + i * 0.05, ease: EASE.prism }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: f.floatDuration,
                  delay: f.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="word-shell" style={{ display: "block" }}>
                  <span
                    ref={(el) => {
                      if (el) nodeRefs.current.set(f.id, el);
                      else nodeRefs.current.delete(f.id);
                    }}
                    style={{
                      display: "block",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                      fontFamily: FONT_GROTESK,
                      fontWeight: 500,
                      fontSize: L.fontSize,
                      color: COLORS.paper,
                      opacity: L.opacity,
                      filter: L.blur ? `blur(${L.blur}px)` : "none",
                    }}
                  >
                    {f.text}
                  </span>
                </span>
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================== *
 * Hero
 * ============================================================== */

function Hero({
  sectionRef,
  viewportWidth,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  viewportWidth: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const pointerRef = usePointer(sectionRef);
  const [showPrism, setShowPrism] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 640px)", () => {
      /*
       * No pin — the hero scrolls away naturally. Over that same natural
       * distance the word field converges onto the central axis and
       * loses its body, the Prism light fades out, and the title block
       * fades with it, so Manifesto arrives as a crossfade rather than a
       * hard cut.
       */
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // half a viewport of scroll, not a full one — if Manifesto's
          // content-driven height is shorter than the viewport, an
          // unreachable "bottom top" end means this fade (and the Prism
          // unmount it drives) can never complete
          end: "bottom center",
          scrub: 0.6,
        },
      })
        .to(".frag", { left: "50%", stagger: { each: 0.015, from: "random" } }, 0)
        .to(".frag-point", { left: "50%", stagger: { each: 0.012, from: "random" } }, 0)
        .to(
          ".word-shell",
          { opacity: 0, filter: "blur(5px)", stagger: { each: 0.012, from: "random" } },
          0.05
        )
        .to(pointsRef.current, { opacity: 0 }, 0.15)
        .to(
          prismRef.current,
          {
            opacity: 0,
            // fully unmount the WebGL canvas once faded rather than just
            // hiding it via CSS — a live canvas can otherwise get
            // composited at a stale screen position once the page has
            // scrolled well past it
            onComplete: () => setShowPrism(false),
            onReverseComplete: () => setShowPrism(true),
          },
          0.25
        )
        .to(contentRef.current, { opacity: 0, yPercent: -10 }, 0.1);
    });

    return () => mm.revert();
  }, [sectionRef]);

  return (
    <section
      ref={sectionRef as RefObject<HTMLElement>}
      style={{
        position: "relative",
        height: "100svh",
        width: "100%",
        overflow: "hidden",
        background: COLORS.ink,
      }}
    >
      <div ref={prismRef} aria-hidden style={{ position: "absolute", inset: 0 }}>
        {showPrism && (
          <Prism
            animationType="hover"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0.5}
            glow={1}
          />
        )}
      </div>

      <div ref={pointsRef} style={{ position: "absolute", inset: 0 }}>
        <LightPoints viewportWidth={viewportWidth} />
      </div>
      <FloatingWords
        pointerRef={pointerRef}
        sectionRef={sectionRef}
        viewportWidth={viewportWidth}
      />

      <div
        ref={contentRef}
        style={{
          position: "relative",
          zIndex: 30,
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
          boxSizing: "border-box",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE.prism, delay: 0.2 }}
          style={{
            fontFamily: FONT_MONO,
            fontSize: "clamp(3rem, 7vw, 6rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "rgba(24, 24, 30, 0.82)",
            margin: 0,
          }}
        >
          SHU FU
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE.settle, delay: 0.5 }}
          style={{
            marginTop: 16,
            maxWidth: "20ch",
            fontFamily: FONT_MONO,
            fontSize: "clamp(1rem, 1.8vw, 1.5rem)",
            lineHeight: 1.4,
            color: "rgba(24, 24, 30, 0.72)",
          }}
        >
          I design for the tomorrow connections
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          style={{
            position: "absolute",
            bottom: 32,
            left: "clamp(1.5rem, 5vw, 4rem)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: FONT_MONO,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: COLORS.paperFaint,
          }}
        >
          <span
            style={{
              position: "relative",
              height: 40,
              width: 1,
              overflow: "hidden",
              background: "rgba(89, 88, 79, 0.4)",
              display: "block",
            }}
          >
            <motion.span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 12,
                background: COLORS.emerald,
                display: "block",
              }}
              animate={{ y: ["-20%", "140%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          Scroll
        </motion.div>
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 40,
          pointerEvents: "none",
          opacity: 0.35,
          mixBlendMode: "overlay",
          backgroundImage: GRAIN_BG,
          backgroundSize: "160px 160px",
        }}
      />
    </section>
  );
}

/* ============================================================== *
 * Manifesto
 * ============================================================== */

function Manifesto({
  sectionRef,
  viewportWidth,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  viewportWidth: number;
}) {
  const wonderRef = useRef<HTMLDivElement>(null);
  const callingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      [wonderRef.current, callingRef.current].forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 55%",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [sectionRef]);

  const isLg = viewportWidth >= 1024;
  const isMd = viewportWidth >= 768;

  return (
    <section
      ref={sectionRef as RefObject<HTMLElement>}
      style={{ position: "relative", minHeight: "100svh", background: COLORS.ink }}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100svh",
          flexDirection: "column",
          justifyContent: "center",
          boxSizing: "border-box",
          padding: "clamp(4rem, 12vh, 8rem) clamp(1.5rem, 5vw, 4rem)",
          paddingLeft: isLg ? 380 : "clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        <div ref={wonderRef} style={{ maxWidth: 672 }}>
          <h2
            style={{
              fontFamily: FONT_MONO,
              fontSize: isMd ? 18 : 16,
              letterSpacing: "0.04em",
              color: COLORS.blue,
              margin: 0,
            }}
          >
            I wonder why
          </h2>
          <p
            style={{
              marginTop: 20,
              fontFamily: FONT_SANS,
              fontSize: isMd ? 20 : 18,
              lineHeight: 1.6,
              color: COLORS.paper,
            }}
          >
            The more advanced our technology becomes, the more I wonder why
            people still feel disconnected.
          </p>
        </div>

        <div ref={callingRef} style={{ marginTop: isMd ? 96 : 64, maxWidth: 672 }}>
          <h2
            style={{
              fontFamily: FONT_MONO,
              fontSize: isMd ? 18 : 16,
              letterSpacing: "0.04em",
              color: COLORS.blue,
              margin: 0,
            }}
          >
            My sincere calling
          </h2>
          <p
            style={{
              marginTop: 20,
              fontFamily: FONT_SANS,
              fontSize: isMd ? 20 : 18,
              lineHeight: 1.6,
              color: COLORS.paper,
            }}
          >
            I use emerging technology to help people feel more understood,
            and more connected to themselves, others, and the world.
          </p>
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.35,
          mixBlendMode: "overlay",
          backgroundImage: GRAIN_BG,
          backgroundSize: "160px 160px",
        }}
      />
    </section>
  );
}

/* ============================================================== *
 * Index sidebar — fixed nav, scrollspy + pointer-proximity hover
 * ============================================================== */

const smoothFalloff = (p: number) => p * p * (3 - 2 * p);
const PROXIMITY_RADIUS = 48;
const SMOOTHING_MS = 120;

type NavItem = {
  num: string;
  label: string;
  ref?: RefObject<HTMLElement | null>;
};

function IndexSidebar({
  heroRef,
  manifestoRef,
  viewportWidth,
}: {
  heroRef: RefObject<HTMLElement | null>;
  manifestoRef: RefObject<HTMLElement | null>;
  viewportWidth: number;
}) {
  const ITEMS = useMemo<NavItem[]>(
    () => [
      { num: "01", label: "Shu's Mindspace", ref: heroRef },
      { num: "02", label: "Manifesto", ref: manifestoRef },
      { num: "03", label: "Intro" },
      { num: "04", label: "Shu's Principle Engine" },
      { num: "05", label: "Featured Works" },
      { num: "06", label: "Shu's Lab" },
    ],
    [heroRef, manifestoRef]
  );

  const wrapRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const indexRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const contentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const targetsRef = useRef<number[]>(ITEMS.map(() => 0));
  const currentRef = useRef<number[]>(ITEMS.map(() => 0));
  const activeIndexRef = useRef(0);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // fade the whole sidebar in as the hero fades out
  useEffect(() => {
    const wrap = wrapRef.current;
    const hero = heroRef.current;
    if (!wrap || !hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wrap, { opacity: 1 });
      return;
    }
    const tween = gsap.fromTo(
      wrap,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [heroRef]);

  // scrollspy: whichever real section is nearest the viewport's center
  useEffect(() => {
    const sections = ITEMS.map((i) => i.ref?.current).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;

    let raf = 0;
    function update() {
      raf = 0;
      const mid = window.innerHeight / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      ITEMS.forEach((item, idx) => {
        const el = item.ref?.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs((r.top + r.bottom) / 2 - mid);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ITEMS]);

  // single rAF loop easing every row's effect toward max(proximity, active)
  useEffect(() => {
    function frame(now: number) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const tau = SMOOTHING_MS / 1000;
      const k = 1 - Math.exp(-dt / tau);

      let moving = false;
      ITEMS.forEach((_, i) => {
        const target = Math.max(
          targetsRef.current[i] ?? 0,
          i === activeIndexRef.current ? 1 : 0
        );
        const cur = currentRef.current[i] ?? 0;
        const next = cur + (target - cur) * k;
        const settled = Math.abs(target - next) < 0.0015;
        const value = settled ? target : next;
        currentRef.current[i] = value;

        const marker = markerRefs.current[i];
        const indexEl = indexRefs.current[i];
        const labelEl = labelRefs.current[i];
        const contentEl = contentRefs.current[i];
        if (marker) {
          marker.style.width = `${14 + value * 18}px`;
          marker.style.opacity = String(0.3 + value * 0.7);
          marker.style.background = lerpColor(
            COLORS.paperFaint,
            COLORS.terracotta,
            value
          );
        }
        if (indexEl)
          indexEl.style.color = lerpColor(COLORS.paperFaint, COLORS.terracotta, value);
        if (labelEl)
          labelEl.style.color = lerpColor(COLORS.paperDim, COLORS.terracotta, value);
        if (contentEl) contentEl.style.transform = `translateX(${value * 10}px)`;

        if (!settled) moving = true;
      });

      rafRef.current = moving ? requestAnimationFrame(frame) : 0;
    }

    function startLoop() {
      if (rafRef.current) return;
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(frame);
    }
    startLoop();

    const rows = rowsRef.current;
    if (!rows) return;

    function handleMove(e: PointerEvent) {
      ITEMS.forEach((_, i) => {
        const row = rowRefs.current[i];
        if (!row) return;
        const rect = row.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(e.clientY - center);
        targetsRef.current[i] = smoothFalloff(
          Math.max(0, 1 - distance / PROXIMITY_RADIUS)
        );
      });
      startLoop();
    }
    function handleLeave() {
      targetsRef.current = targetsRef.current.map(() => 0);
      startLoop();
    }

    rows.addEventListener("pointermove", handleMove, { passive: true });
    rows.addEventListener("pointerleave", handleLeave, { passive: true });
    return () => {
      rows.removeEventListener("pointermove", handleMove);
      rows.removeEventListener("pointerleave", handleLeave);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [activeIndex, ITEMS]);

  if (viewportWidth < 1024) return null;

  return (
    <div
      ref={wrapRef}
      style={{
        pointerEvents: "none",
        position: "fixed",
        left: viewportWidth >= 1280 ? 40 : 24,
        top: "50%",
        zIndex: 50,
        transform: "translateY(-50%)",
        opacity: 0,
        filter:
          "drop-shadow(0 1px 3px rgba(0,0,0,0.9)) drop-shadow(0 0 18px rgba(0,0,0,0.6))",
      }}
    >
      <div
        ref={rowsRef}
        style={{
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {ITEMS.map((item, i) => (
          <div
            key={item.num}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            onClick={() => item.ref?.current?.scrollIntoView({ behavior: "smooth" })}
            style={{ cursor: item.ref ? "pointer" : "default" }}
          >
            <span
              ref={(el) => {
                contentRefs.current[i] = el;
              }}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span
                ref={(el) => {
                  markerRefs.current[i] = el;
                }}
                style={{
                  height: 1,
                  width: 14,
                  flexShrink: 0,
                  background: COLORS.paperFaint,
                  display: "block",
                }}
              />
              <span
                ref={(el) => {
                  indexRefs.current[i] = el;
                }}
                style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.paperFaint }}
              >
                {item.num}
              </span>
              <span
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  color: COLORS.paperDim,
                }}
              >
                {item.label}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================== *
 * Top-level export
 * ============================================================== */

export function ShusMindHeroManifesto() {
  useGoogleFonts();
  const viewportWidth = useViewportWidth();
  const heroRef = useRef<HTMLElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);

  return (
    <div style={{ position: "relative", background: COLORS.ink }}>
      <IndexSidebar
        heroRef={heroRef}
        manifestoRef={manifestoRef}
        viewportWidth={viewportWidth}
      />
      <Hero sectionRef={heroRef} viewportWidth={viewportWidth} />
      <Manifesto sectionRef={manifestoRef} viewportWidth={viewportWidth} />
    </div>
  );
}

export default ShusMindHeroManifesto;
