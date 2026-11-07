import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Diya } from './Diya';
import { AlponaBorder } from './Alpona';
import { audio } from '@/lib/audio';

interface IntroProps {
  onEnter: () => void;
}

/**
 * Full-screen intro: a single unlit diya in the dark.
 * "Tap to light the first diya" — lighting it starts the audio engine
 * (satisfies browser autoplay), spreads the flame to a row of diyas,
 * and reveals the app.
 */
export default function Intro({ onEnter }: IntroProps) {
  const [stage, setStage] = useState<'idle' | 'lighting' | 'spreading' | 'done'>('idle');

  const handleTap = () => {
    if (stage !== 'idle') return;
    setStage('lighting');
    audio.start();
    audio.bell(660);
    setTimeout(() => {
      setStage('spreading');
      audio.bell(880);
    }, 500);
    setTimeout(() => {
      audio.bell(1100);
      setStage('done');
      setTimeout(onEnter, 900);
    }, 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 grid place-items-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === 'done' ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      style={{ background: 'radial-gradient(circle at 50% 50%, #1a0508 0%, #07041a 70%)' }}
    >
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <AnimatePresence mode="wait">
          {stage === 'idle' && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.p
                className="font-display text-2xl font-semibold text-gold-100 glow-text-soft sm:text-3xl"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                Tap to light the first diya
              </motion.p>
              <motion.button
                type="button"
                onClick={handleTap}
                className="group relative grid place-items-center"
                aria-label="Light the first diya"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  className="absolute h-40 w-40 rounded-full"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ background: 'radial-gradient(circle, rgba(255,143,13,0.3) 0%, transparent 70%)' }}
                />
                <Diya lit={false} size={110} onToggle={handleTap} className="drop-shadow-2xl" />
              </motion.button>
              <p className="flex items-center gap-2 font-body text-sm text-gold-300/70">
                <Flame size={14} /> Let the festival begin
              </p>
            </motion.div>
          )}

          {stage !== 'idle' && (
            <motion.div
              key="spread"
              className="flex flex-col items-center gap-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1
                className="font-cinzel text-4xl font-bold tracking-wide text-gold-200 glow-text sm:text-6xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                শুভ দীপাবলি
              </motion.h1>
              <div className="flex items-end justify-center gap-4 sm:gap-8">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{ delay: 0.3 + i * 0.18, type: 'spring', stiffness: 120 }}
                  >
                    <Diya lit size={72 + (i === 2 ? 28 : 0)} flickerSeed={i * 2} />
                  </motion.div>
                ))}
              </div>
              <AlponaBorder className="h-10 w-72 opacity-80" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
