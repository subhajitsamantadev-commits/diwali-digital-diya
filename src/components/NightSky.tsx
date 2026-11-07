import { useEffect, useRef } from 'react';
import { useResponsiveCanvas, useReducedMotion } from '@/hooks/useCanvas';

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
}

/**
 * Animated night-sky background: twinkling stars + drifting bokeh glow.
 * Rendered on a single fixed canvas behind all content.
 */
export default function NightSky() {
  const { canvasRef, ctxRef, sizeRef } = useResponsiveCanvas(2);
  const reduced = useReducedMotion();
  const starsRef = useRef<Star[]>([]);
  const glowRef = useRef<{ x: number; y: number; r: number; hue: number; vx: number; vy: number }[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const initStars = (w: number, h: number) => {
      const count = Math.min(180, Math.floor((w * h) / 9000));
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.85,
          r: Math.random() * 1.4 + 0.3,
          baseAlpha: Math.random() * 0.6 + 0.25,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.005,
        });
      }
      starsRef.current = stars;
    };

    const initGlow = (w: number, h: number) => {
      const glow = [
        { x: w * 0.2, y: h * 0.3, r: w * 0.25, hue: 28, vx: 0.04, vy: 0.02 },
        { x: w * 0.8, y: h * 0.5, r: w * 0.22, hue: 44, vx: -0.03, vy: -0.025 },
        { x: w * 0.5, y: h * 0.75, r: w * 0.3, hue: 14, vx: 0.02, vy: -0.018 },
      ];
      glowRef.current = glow;
    };

    const render = () => {
      if (!mounted) return;
      const ctx = ctxRef.current;
      const { width: w, height: h } = sizeRef.current;
      if (ctx && w && h) {
        ctx.clearRect(0, 0, w, h);

        // soft drifting glows
        for (const g of glowRef.current) {
          g.x += g.vx;
          g.y += g.vy;
          if (g.x < -g.r || g.x > w + g.r) g.vx *= -1;
          if (g.y < -g.r || g.y > h + g.r) g.vy *= -1;
          const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
          grad.addColorStop(0, `hsla(${g.hue}, 90%, 55%, 0.10)`);
          grad.addColorStop(1, 'hsla(0,0%,0%,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }

        // stars
        for (const s of starsRef.current) {
          s.phase += s.speed;
          const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.phase));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 236, 180, ${alpha})`;
          ctx.shadowColor = 'rgba(255, 210, 77, 0.6)';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      rafRef.current = requestAnimationFrame(render);
    };

    const { width, height } = sizeRef.current;
    if (width && height) {
      initStars(width, height);
      initGlow(width, height);
    }
    if (!reduced) {
      rafRef.current = requestAnimationFrame(render);
    } else {
      // single static frame
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        for (const g of glowRef.current) {
          const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
          grad.addColorStop(0, `hsla(${g.hue}, 90%, 55%, 0.08)`);
          grad.addColorStop(1, 'hsla(0,0%,0%,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
        for (const s of starsRef.current) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 236, 180, ${s.baseAlpha})`;
          ctx.fill();
        }
      }
    }

    // re-init on resize
    const ro = new ResizeObserver(() => {
      const { width: w, height: h } = sizeRef.current;
      initStars(w, h);
      initGlow(w, h);
    });
    const parent = canvasRef.current?.parentElement;
    if (parent) ro.observe(parent);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
