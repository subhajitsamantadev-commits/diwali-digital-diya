import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, Sparkles, ChevronDown } from 'lucide-react';
import { Diya, DiyaRow, GrandFinaleDiyas } from './Diya';
import { AlponaBorder, AlponaCorner } from './Alpona';
import Fireworks from './Fireworks';
import { audio } from '@/lib/audio';

/**
 * The landing "hero" experience after the intro: cinematic title,
 * a row of five tap-to-light diyas, fireworks canvas, and a confetti button.
 * Lighting all five unlocks a grand finale.
 */
export default function HomeExperience({ onStartCreating }: { onStartCreating: () => void }) {
  const [litCount, setLitCount] = useState(0);
  const [finale, setFinale] = useState(false);
  const [confettiSignal, setConfettiSignal] = useState(0);
  const finaleRef = useRef(false);

  const toggleDiya = useCallback((index: number) => {
    setLitCount((prev) => {
      const target = index + 1;
      if (prev >= target) {
        // tapping an already-lit earlier diya: keep lit count at max reached
        audio.bell(700 + index * 60);
        return prev;
      }
      // light up to this diya
      audio.bell(660 + index * 80);
      if (target >= 5 && !finaleRef.current) {
        finaleRef.current = true;
        setTimeout(() => {
          setFinale(true);
          setConfettiSignal((s) => s + 1);
          audio.bell(1320);
        }, 400);
      }
      return target;
    });
  }, []);

  useEffect(() => {
    // a couple of ambient fireworks while idle
  }, []);

  return (
    <div className="relative w-full">
      {/* HERO */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* fireworks layer (tap enabled) */}
        <div className="pointer-events-auto absolute inset-0 z-0">
          <Fireworks
            interactive
            autoInterval={finale ? 1200 : 4000}
            confettiSignal={confettiSignal}
            className="h-full w-full"
            onLaunch={() => audio.whoosh()}
            onBurst={() => audio.boom()}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <AlponaBorder className="h-10 w-64 opacity-70" />
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, type: 'spring', stiffness: 80 }}
            className="font-cinzel text-5xl font-bold leading-tight text-gold-200 glow-text sm:text-7xl lg:text-8xl"
          >
            Diwali Digital Diya
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="font-display text-xl text-saffron-200 glow-text-soft sm:text-2xl"
          >
            শুভ দীপাবলি · शुभ दीवाली · Happy Diwali
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="max-w-xl font-body text-gold-300/80"
          >
            Light a diya, launch a firework, and send a glowing greeting across the Kolkata night sky.
          </motion.p>

          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button onClick={onStartCreating} className="btn-primary">
              <Sparkles size={16} /> Create a greeting
            </button>
            <button onClick={() => setConfettiSignal((s) => s + 1)} className="btn-ghost">
              <PartyPopper size={16} /> Confetti
            </button>
          </div>
          <p className="font-body text-xs text-gold-300/50">Tap anywhere to launch a firework · move your finger for a sparkler trail</p>
        </div>

        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold-300/60"
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <ChevronDown />
        </motion.div>
      </section>

      {/* DIYA LIGHTING SECTION */}
      <section className="relative mx-auto w-full max-w-4xl px-6 py-20 text-center sm:py-28">
        <AlponaCorner className="absolute left-0 top-10 hidden sm:block" size={90} />
        <AlponaCorner className="absolute right-0 top-10 hidden sm:block" size={90} />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-cinzel text-3xl font-bold text-gold-200 glow-text sm:text-5xl"
        >
          Light the Five Diyas
        </motion.h2>
        <p className="mx-auto mt-3 max-w-md font-body text-gold-300/70">
          Tap each diya to light it. When all five glow, the night sky celebrates.
        </p>

        <div className="mt-14">
          <DiyaRow count={5} litCount={litCount} size={100} onToggleAt={toggleDiya} />
        </div>

        <div className="mt-10 h-24">
          {finale ? (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
              <GrandFinaleDiyas active />
              <p className="font-cinzel text-2xl font-bold text-gold-200 glow-text">The grand finale has begun!</p>
            </motion.div>
          ) : (
            <p className="font-body text-gold-300/50">
              {litCount === 0 && 'All five await your spark'}
              {litCount > 0 && litCount < 5 && `${litCount} lit · ${5 - litCount} to go`}
              {litCount >= 5 && 'Let the sky rejoice…'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
