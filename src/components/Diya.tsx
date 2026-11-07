import { memo } from 'react';
import { cn, clamp } from '@/lib/utils';

export interface DiyaProps {
  lit: boolean;
  size?: number;
  className?: string;
  flickerSeed?: number;
  onToggle?: () => void;
  /** when true, disables hover/tap scale for passive display */
  static?: boolean;
}

/**
 * A handcrafted SVG diya with a flickering flame and warm glow.
 * Tap to light / unlight. The flame uses a CSS flicker animation;
 * the glow scales with the `lit` state for a smooth transition.
 */
function DiyaBase({ lit, size = 96, className, flickerSeed = 0, onToggle, static: isStatic = false }: DiyaProps) {
  const flameDelay = `${(flickerSeed % 10) * 0.04}s`;
  const glowOpacity = lit ? 1 : 0;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!onToggle}
      aria-pressed={lit}
      aria-label={lit ? 'Diya is lit — tap to extinguish' : 'Diya is unlit — tap to light'}
      className={cn(
        'relative grid place-items-center',
        onToggle && !isStatic && 'cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95',
        !onToggle && 'cursor-default',
        className,
      )}
      style={{ width: size, height: size * 1.25 }}
    >
      {/* glow halo */}
      <div
        className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700"
        style={{
          width: size * 1.4,
          height: size * 1.4,
          opacity: glowOpacity,
          background: 'radial-gradient(circle, rgba(255,180,40,0.55) 0%, rgba(255,120,20,0.25) 35%, rgba(0,0,0,0) 70%)',
          filter: 'blur(6px)',
        }}
      />
      <svg
        viewBox="0 0 100 125"
        width={size}
        height={size * 1.25}
        aria-hidden="true"
        className="relative z-10"
      >
        {/* flame */}
        <g
          style={{
            transformOrigin: '50px 60px',
            transformBox: 'fill-box',
          }}
        >
          {lit && (
            <>
              {/* outer flame */}
              <path
                d="M50 30 C 58 45 62 52 58 62 C 55 70 45 70 42 62 C 38 52 44 45 50 30 Z"
                fill="url(#flameOuter)"
                className="animate-flame-flicker"
                style={{ animationDelay: flameDelay }}
              />
              {/* inner flame */}
              <path
                d="M50 42 C 55 52 57 56 54 63 C 51 68 49 68 46 63 C 43 56 47 52 50 42 Z"
                fill="url(#flameInner)"
                className="animate-flame-flicker"
                style={{ animationDelay: `${flameDelay}s`, animationDuration: '0.22s' }}
              />
              {/* core */}
              <ellipse cx="50" cy="58" rx="3" ry="6" fill="#fffbe6" opacity="0.9" className="animate-flame-flicker" style={{ animationDelay: `${flameDelay}s`, animationDuration: '0.15s' }} />
              {/* wick */}
              <rect x="48.5" y="62" width="3" height="8" rx="1.5" fill="#3a1c00" />
            </>
          )}
          {!lit && <rect x="48.5" y="62" width="3" height="8" rx="1.5" fill="#5c2b00" />}
        </g>

        <defs>
          <linearGradient id="flameOuter" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff8f0d" />
            <stop offset="60%" stopColor="#ffae3d" />
            <stop offset="100%" stopColor="#ffd24d" />
          </linearGradient>
          <linearGradient id="flameInner" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ffd24d" />
            <stop offset="100%" stopColor="#fffbe6" />
          </linearGradient>
          <linearGradient id="diyaBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a3a1a" />
            <stop offset="55%" stopColor="#5c2b00" />
            <stop offset="100%" stopColor="#3a1c00" />
          </linearGradient>
          <linearGradient id="diyaRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c87a2a" />
            <stop offset="100%" stopColor="#8a4000" />
          </linearGradient>
        </defs>

        {/* diya bowl */}
        <path
          d="M18 78 C 18 92 32 104 50 104 C 68 104 82 92 82 78 Z"
          fill="url(#diyaBody)"
        />
        {/* rim */}
        <ellipse cx="50" cy="78" rx="32" ry="7" fill="url(#diyaRim)" />
        <ellipse cx="50" cy="76" rx="28" ry="5" fill="#2a1400" opacity="0.6" />
        {/* decorative dots */}
        {[20, 30, 40, 50, 60, 70, 80].map((x) => (
          <circle key={x} cx={x} cy={90 + Math.sin((x - 50) / 50) * 3} r="1.4" fill="#ffd24d" opacity={lit ? 0.9 : 0.4} />
        ))}
        {/* highlight when lit */}
        <ellipse cx="50" cy="78" rx="32" ry="7" fill="none" stroke="rgba(255,200,80,0.5)" strokeWidth="1.5" opacity={glowOpacity} style={{ transition: 'opacity 0.6s' }} />
      </svg>
    </button>
  );
}

export const Diya = memo(DiyaBase);

/** A row of diyas that lights progressively. */
export function DiyaRow({
  count = 5,
  litCount,
  size = 80,
  onToggleAt,
  className,
}: {
  count?: number;
  litCount: number;
  size?: number;
  onToggleAt?: (index: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-center gap-3 sm:gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Diya
          key={i}
          lit={i < litCount}
          size={size}
          flickerSeed={i * 3}
          onToggle={onToggleAt ? () => onToggleAt(i) : undefined}
        />
      ))}
    </div>
  );
}

/** Grand finale: all diyas lit + extra sparkles, used after all five are lit. */
export function GrandFinaleDiyas({ active }: { active: boolean }) {
  const count = 7;
  return (
    <div className="pointer-events-none flex flex-wrap items-end justify-center gap-2 opacity-0 transition-all duration-1000" style={{ opacity: active ? 1 : 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Diya key={i} lit={active} size={clamp(56 + (i % 3) * 14, 56, 84)} flickerSeed={i + 11} static />
      ))}
    </div>
  );
}
