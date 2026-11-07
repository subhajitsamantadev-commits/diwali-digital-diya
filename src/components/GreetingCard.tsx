import { forwardRef } from 'react';
import type { Theme, GreetingLanguage } from '@/lib/types';
import { LANGUAGE_GREETINGS } from '@/lib/types';
import { AlponaCorner, AlponaBorder } from './Alpona';
import { Diya } from './Diya';

interface GreetingCardProps {
  senderName: string;
  receiverName: string;
  message: string;
  language: GreetingLanguage;
  theme: Theme;
  /** shown as the receiver's name in sparkler style */
  highlightName?: boolean;
}

/**
 * The visual greeting card. Renders into a fixed 720x960 stage so it can be
 * rasterised identically for the "Download as image" feature.
 */
const GreetingCard = forwardRef<HTMLDivElement, GreetingCardProps>(function GreetingCard(
  { senderName, receiverName, message, language, theme, highlightName = false },
  ref,
) {
  const heading = LANGUAGE_GREETINGS[language];
  const fontClass = language === 'bn' ? 'font-bengali' : language === 'hi' ? 'font-devanagari' : 'font-display';

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center justify-between overflow-hidden rounded-3xl p-10"
      style={{
        background: theme.background,
        color: theme.text,
        width: 720,
        height: 960,
        boxShadow: `0 0 80px ${theme.glow}`,
        border: `1px solid ${theme.secondary}33`,
      }}
    >
      {/* glow blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full" style={{ background: `radial-gradient(circle, ${theme.primary}55, transparent 70%)`, filter: 'blur(20px)' }} />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full" style={{ background: `radial-gradient(circle, ${theme.secondary}44, transparent 70%)`, filter: 'blur(24px)' }} />

      <AlponaCorner className="absolute left-2 top-2" color={theme.secondary} size={70} />
      <AlponaCorner className="absolute right-2 top-2" color={theme.secondary} size={70} />
      <AlponaCorner className="absolute bottom-2 left-2" color={theme.secondary} size={70} />
      <AlponaCorner className="absolute bottom-2 right-2" color={theme.secondary} size={70} />

      <div className="relative z-10 flex flex-col items-center gap-6 pt-8 text-center">
        <div className="flex gap-3">
          <Diya lit size={56} flickerSeed={1} static />
          <Diya lit size={64} flickerSeed={2} static />
          <Diya lit size={56} flickerSeed={3} static />
        </div>
        <h2
          className={`${fontClass} text-5xl font-bold tracking-wide`}
          style={{ color: theme.secondary, textShadow: `0 0 18px ${theme.glow}, 0 0 36px ${theme.glow}` }}
        >
          {heading}
        </h2>
        {highlightName && (
          <p
            className="font-display text-2xl font-semibold"
            style={{ color: theme.accent, textShadow: `0 0 12px ${theme.accent}` }}
          >
            for {receiverName || 'You'}
          </p>
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-[560px] text-center">
        {highlightName && (
          <p className="mb-4 font-display text-3xl font-bold" style={{ color: theme.accent, textShadow: `0 0 16px ${theme.accent}` }}>
            Dear {receiverName || 'You'},
          </p>
        )}
        <p
          className={`${fontClass} text-2xl leading-relaxed`}
          style={{ color: theme.text, textShadow: `0 0 10px ${theme.glow}` }}
        >
          {message || 'Your warm Diwali message will glow here.'}
        </p>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center gap-4 pb-8">
        <AlponaBorder className="h-10 w-80" color={theme.secondary} />
        <div className="flex gap-3">
          <Diya lit size={48} flickerSeed={4} static />
          <Diya lit size={56} flickerSeed={5} static />
          <Diya lit size={48} flickerSeed={6} static />
        </div>
        <p className="font-body text-base" style={{ color: theme.accent }}>
          — {senderName || 'With love'}
        </p>
        <p className="font-body text-xs opacity-60">Made with love by Subhajit Samanta · Powered by Firebase and Gemini</p>
      </div>
    </div>
  );
});

export default GreetingCard;
