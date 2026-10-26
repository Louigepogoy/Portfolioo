"use client";

import { useEffect, useRef } from "react";

// Animated "dust vortex" background: particles orbit and slowly spiral into a dark core.
// The core is anchored to the hero photo, so the photo sits inside the vortex.
export default function DustVortex({ anchor = ".hero__photo" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w, h, dpr, cx, cy, scale, particles, raf;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    // Colors come from CSS variables so the vortex follows the light/dark theme.
    let colors;
    function readColors() {
      const css = getComputedStyle(document.documentElement);
      colors = {
        dust: css.getPropertyValue("--dust-rgb").trim() || "236, 233, 247",
        bg: css.getPropertyValue("--bg-rgb").trim() || "11, 10, 20",
        blend: css.getPropertyValue("--dust-blend").trim() || "lighter",
      };
    }
    readColors();

    const TILT = 0.62; // flattens the disc so it looks seen from an angle
    const ROT = 0.38; // tilts the disc (radians) so the bright arc sweeps down to the right
    const ROT_COS = Math.cos(ROT);
    const ROT_SIN = Math.sin(ROT);
    const CORE = 0.2; // radius of the dark hole (relative to scale)
    const BAND = 0.32; // width of the bright inner band

    function spawn(p, fresh) {
      // Bias radii toward the inner ring so the bright band hugs the hole.
      const t = Math.random();
      p.r = CORE * 1.02 + Math.pow(t, fresh ? 2.4 : 0.8) * 1.6;
      p.a = Math.random() * Math.PI * 2;
      p.size = Math.random() < 0.07 ? 1.8 + Math.random() * 1.2 : 0.7 + Math.random() * 1.1;
      p.alpha = 0.3 + Math.random() * 0.7;
      p.drift = 0.0002 + Math.random() * 0.0005;
      p.lift = (Math.random() - 0.5) * 0.18; // vertical thickness of the disc
      return p;
    }

    // Follow the anchor element (the hero photo) so the vortex scrolls with it.
    function locate() {
      const el = document.querySelector(anchor);
      if (!el) {
        cx = w * 0.7;
        cy = h * 0.4;
        scale = Math.max(w, h) * 0.6;
        return;
      }
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      scale = (Math.max(r.width, r.height) * 0.6) / CORE;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      locate();

      const count = Math.round(Math.min(16000, (w * h) / (w < 900 ? 70 : 85)));
      particles = Array.from({ length: count }, () => spawn({}, true));
    }

    function project(p) {
      const dx = Math.cos(p.a) * p.r * scale;
      const dy = (Math.sin(p.a) * TILT + p.lift * p.r) * p.r * scale;
      const x = cx + dx * ROT_COS - dy * ROT_SIN + mouse.x * p.r * 24;
      const y = cy + dx * ROT_SIN + dy * ROT_COS + mouse.y * p.r * 14;
      return [x, y];
    }

    function drawParticle(p) {
      const [x, y] = project(p);
      if (x < -5 || x > w + 5 || y < -5 || y > h + 5) return;
      // Brighter close to the core and on the near (front) side of the disc.
      const inner = Math.max(0, 1 - (p.r - CORE) / BAND);
      const front = 0.5 + 0.5 * Math.sin(p.a);
      const a = p.alpha * (0.18 + inner * inner * 1.8) * (0.3 + front * 0.7);
      ctx.fillStyle = `rgba(${colors.dust}, ${Math.min(a, 1)})`;
      ctx.fillRect(x, y, p.size, p.size);
    }

    function drawCore() {
      const r = CORE * scale;
      const g = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.15);
      g.addColorStop(0, `rgba(${colors.bg}, 1)`);
      g.addColorStop(0.7, `rgba(${colors.bg}, 0.92)`);
      g.addColorStop(1, `rgba(${colors.bg}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame(step = true) {
      ctx.clearRect(0, 0, w, h);
      locate();
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      if (step) {
        for (const p of particles) {
          // Inner dust orbits faster, and everything slowly falls inward.
          p.a += 0.0011 / Math.pow(p.r, 1.5);
          p.r -= p.drift * (1 + 0.5 / p.r);
          if (p.r < CORE) spawn(p, false);
        }
      }

      // Back half, then the dark core, then the front half passes in front of it.
      // Additive blending makes dense areas glow like the reference shader.
      ctx.globalCompositeOperation = colors.blend;
      for (const p of particles) if (Math.sin(p.a) < 0) drawParticle(p);
      ctx.globalCompositeOperation = "source-over";
      drawCore();
      ctx.globalCompositeOperation = colors.blend;
      for (const p of particles) if (Math.sin(p.a) >= 0) drawParticle(p);
      ctx.globalCompositeOperation = "source-over";
    }

    function loop() {
      frame();
      raf = requestAnimationFrame(loop);
    }

    function onMove(e) {
      mouse.tx = e.clientX / w - 0.5;
      mouse.ty = e.clientY / h - 0.5;
    }

    const redraw = () => frame(false);
    const onTheme = () => {
      readColors();
      if (reduceMotion) redraw();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("themechange", onTheme);
    if (reduceMotion) {
      redraw();
      window.addEventListener("scroll", redraw, { passive: true });
    } else {
      window.addEventListener("pointermove", onMove);
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", redraw);
      window.removeEventListener("themechange", onTheme);
    };
  }, [anchor]);

  return (
    <div className="vortex" aria-hidden>
      <canvas ref={canvasRef} />
      <div className="vortex__shade" />
    </div>
  );
}
