import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, ArrowLeft, Loader2, Sparkles, PartyPopper } from 'lucide-react';
import type { Greeting, Theme } from '@/lib/types';
import { THEMES, LANGUAGE_GREETINGS } from '@/lib/types';
import { getGreeting } from '@/lib/greetings';
import { audio } from '@/lib/audio';
import Fireworks from './Fireworks';
import { Diya, GrandFinaleDiyas } from './Diya';
import { AlponaBorder } from './Alpona';

interface ReceiverPageProps {
  shortId: string;
  onSendBack: () => void;
}

export default function ReceiverPage({ shortId, onSendBack }: ReceiverPageProps) {
  const [greeting, setGreeting] = useState<Greeting | null | 'loading'>(null);
  const [phase, setPhase] = useState<'loading' | 'name' | 'typing' | 'diyas' | 'finale'>('loading');
  const [typed, setTyped] = useState('');
  const [litCount, setLitCount] = useState(0);
  const [confettiSignal, setConfettiSignal] = useState(0);
  const finaleStartedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    setGreeting('loading');
    getGreeting(shortId).then((g) => {
      if (cancelled) return;
      setGreeting(g);
      if (g) {
        audio.bell(880);
        setTimeout(() => setPhase('name'), 600);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [shortId]);

  const g = greeting && greeting !== 'loading' ? greeting : null;
  const theme = g ? THEMES[g.theme] : THEMES.saffron;
  const heading = g ? LANGUAGE_GREETINGS[g.language] : LANGUAGE_GREETINGS.en;
  const fontClass = g
    ? g.language === 'bn'
      ? 'font-bengali'
      : g.language === 'hi'
        ? 'font-devanagari'
        : 'font-display'
    : 'font-display';

  // name reveal -> typing
  useEffect(() => {
    if (phase !== 'name' || !g) return;
    const t = setTimeout(() => setPhase('typing'), 2200);
    return () => clearTimeout(t);
  }, [phase, g]);

  // typewriter
  useEffect(() => {
    if (phase !== 'typing' || !g) return;
    let i = 0;
    const full = g.message;
    const interval = window.setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i % 2 === 0) audio.crumble();
      if (i >= full.length) {
        window.clearInterval(interval);
        setTimeout(() => setPhase('diyas'), 800);
      }
    }, 32);
    return () => window.clearInterval(interval);
  }, [phase, g]);

  // auto light diyas one by one
  useEffect(() => {
    if (phase !== 'diyas') return;
    let n = 0;
    const interval = window.setInterval(() => {
      n++;
      setLitCount(n);
      audio.bell(660 + n * 80);
      if (n >= 5) {
        window.clearInterval(interval);
        setTimeout(() => {
          if (!finaleStartedRef.current) {
            finaleStartedRef.current = true;
            setPhase('finale');
            setConfettiSignal((s) => s + 1);
            audio.bell(1320);
          }
        }, 600);
      }
    }, 450);
    return () => window.clearInterval(interval);
  }, [phase]);

  if (greeting === 'loading') {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-4 text-gold-200">
          <Loader2 className="animate-spin" size={32} />
          <p className="font-body">Lighting your greeting…</p>
        </div>
      </div>
    );
  }

  if (!g) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div className="glass-strong max-w-md rounded-3xl p-10">
          <h2 className="font-cinzel text-2xl font-bold text-gold-200">This diya has gone out</h2>
          <p className="mt-3 font-body text-gold-300/70">We couldn't find that greeting. The link may be incomplete or expired.</p>
          <Link href="/#/" className="btn-primary mt-6">
            <ArrowLeft size={16} /> Back to the festival
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: theme.background }}>
      {/* fireworks layer */}
      <div className="pointer-events-auto absolute inset-0 z-0">
        <Fireworks
          interactive={phase === 'finale'}
          autoInterval={phase === 'finale' ? 1800 : 0}
          confettiSignal={confettiSignal}
          className="h-full w-full"
          onLaunch={() => audio.whoosh()}
          onBurst={() => audio.boom()}
        />
      </div>

      {/* content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${fontClass} text-2xl font-semibold sm:text-3xl`}
          style={{ color: theme.secondary, textShadow: `0 0 16px ${theme.glow}` }}
        >
          {heading}
        </motion.p>

        {/* sparkler name */}
        <AnimatePresence>
          {phase !== 'loading' && (
            <motion.h1
              key="name"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
              className="relative mt-6 font-cinzel text-5xl font-bold sm:text-7xl"
              style={{
                color: theme.accent,
                textShadow: `0 0 14px ${theme.accent}, 0 0 28px ${theme.glow}, 0 0 56px ${theme.glow}`,
              }}
            >
              {g.receiverName}
              {/* sparkler shimmer */}
              <motion.span
                className="pointer-events-none absolute inset-0"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.accent}88, transparent)`,
                  mixBlendMode: 'overlay',
                }}
              />
            </motion.h1>
          )}
        </AnimatePresence>

        {/* typed message */}
        {(phase === 'typing' || phase === 'diyas' || phase === 'finale') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 max-w-xl"
          >
            <p
              className={`${fontClass} text-xl leading-relaxed sm:text-2xl`}
              style={{ color: theme.text, textShadow: `0 0 10px ${theme.glow}` }}
            >
              {typed}
              <span className="ml-0.5 inline-block w-[2px] animate-pulse" style={{ background: theme.accent, height: '1.1em', verticalAlign: 'text-bottom' }} />
            </p>
            {(phase === 'diyas' || phase === 'finale') && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 font-body text-base"
                style={{ color: theme.accent }}
              >
                — {g.senderName}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* diyas */}
        {(phase === 'diyas' || phase === 'finale') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <DiyaRowLike litCount={litCount} theme={theme} />
          </motion.div>
        )}

        {/* finale */}
        {phase === 'finale' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex flex-col items-center gap-6"
          >
            <GrandFinaleDiyas active />
            <AlponaBorder className="h-10 w-72" color={theme.secondary} />
            <p className="font-cinzel text-2xl font-bold glow-text" style={{ color: theme.secondary }}>
              শুভ দীপাবলি · Happy Diwali
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setConfettiSignal((s) => s + 1)} className="btn-primary">
                <PartyPopper size={16} /> Celebrate again
              </button>
              <button onClick={onSendBack} className="btn-ghost">
                <Sparkles size={16} /> Send one back
              </button>
              <Link href="/#/" className="btn-ghost">
                <ArrowLeft size={16} /> Make your own
              </Link>
            </div>
            <p className="mt-2 font-body text-xs opacity-60">Tap anywhere to launch a firework</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DiyaRowLike({ litCount }: { litCount: number; theme: Theme }) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Diya key={i} lit={i < litCount} size={84} flickerSeed={i * 3} static />
      ))}
    </div>
  );
}
