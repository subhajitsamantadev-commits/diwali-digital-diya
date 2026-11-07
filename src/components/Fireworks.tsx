import { useCallback, useEffect, useRef } from 'react';
import { useResponsiveCanvas, useReducedMotion, useVisibilityPause } from '@/hooks/useCanvas';
import { audio } from '@/lib/audio';

type FireworkShape = 'ring' | 'heart' | 'flower' | 'diwali';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  sat: number;
  light: number;
  gravity: number;
  drag: number;
  shape?: 'dot' | 'streak';
  text?: string;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  hue: number;
  trail: { x: number; y: number; a: number }[];
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
}

interface Confetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  life: number;
  color: string;
  size: number;
}

const SHAPES: FireworkShape[] = ['ring', 'heart', 'flower', 'diwali'];
const PALETTE = [
  [28, 95, 60],
  [44, 95, 62],
  [350, 85, 60],
  [50, 95, 60],
  [180, 70, 55],
  [12, 90, 58],
];

function heartPoint(t: number, scale: number): [number, number] {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return [x * scale, y * scale];
}

const DIWALI_CHARS = ['D', 'I', 'W', 'A', 'L', 'I'];

interface FireworksProps {
  /** enables tap-to-launch and the sparkler */
  interactive?: boolean;
  /** auto-launch interval in ms; 0 disables */
  autoInterval?: number;
  className?: string;
  /** triggered once when a confetti burst is requested externally */
  confettiSignal?: number;
  /** called when a firework launches (for audio) */
  onLaunch?: () => void;
  onBurst?: () => void;
}

export default function Fireworks({
  interactive = true,
  autoInterval = 0,
  className = '',
  confettiSignal,
  onLaunch,
  onBurst,
}: FireworksProps) {
  const { canvasRef, ctxRef, sizeRef } = useResponsiveCanvas(2);
  const reduced = useReducedMotion();
  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const confettiRef = useRef<Confetti[]>([]);
  const sparklerRef = useRef<{ x: number; y: number; active: boolean }>({ x: -999, y: -999, active: false });
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastAutoRef = useRef(0);
  const pausedRef = useRef(false);
  const onLaunchRef = useRef(onLaunch);
  const onBurstRef = useRef(onBurst);
  onLaunchRef.current = onLaunch;
  onBurstRef.current = onBurst;

  const launchRocket = useCallback((x?: number, y?: number) => {
    const { width: w, height: h } = sizeRef.current;
    if (!w || !h) return;
    const startX = x ?? Math.random() * w;
    const targetY = y ?? h * (0.15 + Math.random() * 0.3);
    const hue = PALETTE[Math.floor(Math.random() * PALETTE.length)][0];
    rocketsRef.current.push({
      x: startX,
      y: h,
      targetY,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -9 - Math.random() * 2,
      hue,
      trail: [],
    });
    onLaunchRef.current?.();
  }, [sizeRef]);

  const burst = useCallback((x: number, y: number, shape?: FireworkShape) => {
    const s = shape ?? SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const [hue, sat, light] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const particles = particlesRef.current;

    if (s === 'diwali') {
      DIWALI_CHARS.forEach((ch, i) => {
        const angle = (i / DIWALI_CHARS.length) * Math.PI * 2;
        const r = 50;
        const cx = x + Math.cos(angle) * r;
        const cy = y + Math.sin(angle) * r;
        const p: Particle = {
          x: cx,
          y: cy,
          vx: Math.cos(angle) * 0.4,
          vy: Math.sin(angle) * 0.4 - 0.3,
          life: 90,
          maxLife: 90,
          size: 18,
          hue,
          sat,
          light,
          gravity: 0.005,
          drag: 0.96,
          shape: 'dot',
          text: ch,
        };
        particles.push(p);
      });
    } else if (s === 'heart') {
      const count = 60;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const [hx, hy] = heartPoint(t, 0.35);
        const speed = 1.4 + Math.random() * 0.3;
        const a = Math.atan2(hy, hx);
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 70 + Math.random() * 30,
          maxLife: 100,
          size: 2.2,
          hue,
          sat,
          light,
          gravity: 0.04,
          drag: 0.97,
          shape: 'streak',
        });
      }
    } else if (s === 'flower') {
      const petals = 6;
      const perPetal = 14;
      for (let p = 0; p < petals; p++) {
        const base = (p / petals) * Math.PI * 2;
        for (let i = 0; i < perPetal; i++) {
          const spread = (i / perPetal - 0.5) * 0.5;
          const a = base + spread;
          const speed = 2 + Math.random() * 1.5;
          particles.push({
            x,
            y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            life: 70 + Math.random() * 30,
            maxLife: 100,
            size: 2,
            hue: hue + (p % 2) * 20,
            sat,
            light,
            gravity: 0.05,
            drag: 0.96,
            shape: 'streak',
          });
        }
      }
    } else {
      // ring
      const count = 70;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const speed = 2.2 + Math.random() * 0.6;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 70 + Math.random() * 30,
          maxLife: 100,
          size: 2.4,
          hue,
          sat,
          light,
          gravity: 0.05,
          drag: 0.96,
          shape: 'streak',
        });
      }
    }
    onBurstRef.current?.();
  }, []);

  const launchConfetti = useCallback(() => {
    const { width: w, height: h } = sizeRef.current;
    if (!w || !h) return;
    const colors = ['#ff8f0d', '#ffd24d', '#c64a55', '#5c6bff', '#2ecc71', '#ffe4b8'];
    for (let i = 0; i < 140; i++) {
      confettiRef.current.push({
        x: w / 2 + (Math.random() - 0.5) * w * 0.4,
        y: h * 0.2 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 2 + 1,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        life: 160,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5,
      });
    }
    audio.pop();
  }, [sizeRef]);

  // expose confetti trigger
  useEffect(() => {
    if (confettiSignal && confettiSignal > 0) launchConfetti();
  }, [confettiSignal, launchConfetti]);

  // pointer interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !interactive) return;

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      const { x, y } = getPos(e);
      launchRocket(x, y);
      sparklerRef.current = { x, y, active: true };
    };
    const onMove = (e: PointerEvent) => {
      if (!sparklerRef.current.active) return;
      const { x, y } = getPos(e);
      sparklerRef.current = { x, y, active: true };
      for (let i = 0; i < 3; i++) {
        sparksRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 + 0.5,
          life: 20 + Math.random() * 15,
          hue: 40 + Math.random() * 20,
        });
      }
    };
    const onUp = () => {
      sparklerRef.current.active = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [canvasRef, interactive, launchRocket]);

  useVisibilityPause(
    () => {
      pausedRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    () => {
      pausedRef.current = false;
      loop();
    },
  );

  const loop = useCallback(() => {
    if (pausedRef.current) return;
    const ctx = ctxRef.current;
    const { width: w, height: h } = sizeRef.current;
    if (ctx && w && h) {
      // fade trail
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(7, 4, 26, 0.18)';
      ctx.fillRect(0, 0, w, h);

      // auto launch
      if (autoInterval > 0 && performance.now() - lastAutoRef.current > autoInterval) {
        lastAutoRef.current = performance.now();
        launchRocket();
      }

      ctx.globalCompositeOperation = 'lighter';

      // rockets
      const rockets = rocketsRef.current;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.12;
        r.trail.unshift({ x: r.x, y: r.y, a: 1 });
        if (r.trail.length > 14) r.trail.pop();
        for (let t = 0; t < r.trail.length; t++) {
          const tp = r.trail[t];
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, 2 - t * 0.1, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${r.hue}, 95%, 65%, ${1 - t / r.trail.length})`;
          ctx.fill();
        }
        if (r.y <= r.targetY || r.vy >= 0) {
          burst(r.x, r.y);
          audio.boom();
          rockets.splice(i, 1);
        }
      }

      // particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const alpha = Math.max(0, p.life / p.maxLife);
        if (p.text) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `hsl(${p.hue}, ${p.sat}%, ${p.light}%)`;
          ctx.font = `bold ${p.size}px Cinzel, serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = `hsla(${p.hue}, 95%, 70%, 0.8)`;
          ctx.shadowBlur = 12;
          ctx.fillText(p.text, p.x, p.y);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        } else if (p.shape === 'streak') {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`;
          ctx.fill();
        }
        if (p.life <= 0) particles.splice(i, 1);
      }

      // sparks (sparkler)
      const sparks = sparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.life--;
        const a = Math.max(0, s.life / 35);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5 * a + 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 100%, 70%, ${a})`;
        ctx.fill();
        if (s.life <= 0) sparks.splice(i, 1);
      }

      // confetti
      ctx.globalCompositeOperation = 'source-over';
      const confetti = confettiRef.current;
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.08;
        c.vx *= 0.99;
        c.rot += c.vrot;
        c.life--;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = Math.max(0, c.life / 160);
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
        ctx.globalAlpha = 1;
        if (c.life <= 0 || c.y > h + 30) confetti.splice(i, 1);
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [autoInterval, burst, launchRocket, sizeRef]);

  useEffect(() => {
    if (reduced) return;
    loop();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loop, reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label={interactive ? 'Fireworks display — tap anywhere to launch a firework' : 'Animated fireworks display'}
      role="img"
      style={{ touchAction: interactive ? 'none' : 'auto' }}
    />
  );
}
