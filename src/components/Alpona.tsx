/**
 * Decorative alpona-style (Bengali rangoli) SVG border.
 * Symmetric floral-petal motif that tiles horizontally.
 */
export function AlponaBorder({ className = '', color = '#ffd24d', flip = false }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleY(-1)' } : undefined}
    >
      <defs>
        <linearGradient id="alpgrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#alpgrad)" strokeWidth="1.2" strokeLinecap="round">
        {Array.from({ length: 6 }).map((_, i) => {
          const x = 20 + i * 40;
          return (
            <g key={i} transform={`translate(${x} 20)`}>
              <circle r="3" fill={color} fillOpacity="0.5" stroke="none" />
              {Array.from({ length: 8 }).map((_, p) => {
                const a = (p / 8) * Math.PI * 2;
                return (
                  <path
                    key={p}
                    d={`M0 0 Q ${Math.cos(a) * 6} ${Math.sin(a) * 6} ${Math.cos(a) * 12} ${Math.sin(a) * 12}`}
                    opacity="0.7"
                  />
                );
              })}
            </g>
          );
        })}
        <line x1="0" y1="20" x2="240" y2="20" opacity="0.3" />
      </g>
    </svg>
  );
}

/** A single alpona mandala corner ornament. */
export function AlponaCorner({ className = '', color = '#ffd24d', size = 80 }: { className?: string; color?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 80 80" aria-hidden="true" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.65">
      <g transform="translate(40 40)">
        {Array.from({ length: 12 }).map((_, p) => {
          const a = (p / 12) * Math.PI * 2;
          return (
            <g key={p} transform={`rotate(${(a * 180) / Math.PI})`}>
              <path d="M0 0 C 6 -4 12 -10 18 -14" opacity="0.8" />
              <circle cx="18" cy="-14" r="1.6" fill={color} stroke="none" opacity="0.7" />
              <path d="M0 6 Q 8 4 14 10" opacity="0.5" />
            </g>
          );
        })}
        <circle r="5" fill={color} fillOpacity="0.35" stroke="none" />
        <circle r="9" />
        <circle r="22" opacity="0.3" />
      </g>
    </svg>
  );
}
