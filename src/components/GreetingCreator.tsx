import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, Copy, Download, MessageCircle, Loader2, Check, Wand2 } from 'lucide-react';
import type { GreetingLanguage, GreetingTone, ThemeKey } from '@/lib/types';
import { THEMES, LANGUAGE_LABELS, TONE_LABELS } from '@/lib/types';
import { buildDefaultMessage, cn } from '@/lib/utils';
import { saveGreeting } from '@/lib/greetings';
import { audio } from '@/lib/audio';
import { downloadElementAsImage } from '@/lib/download';
import GreetingCard from './GreetingCard';

interface CreatorProps {
  onShareCreated?: (shortId: string) => void;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

export default function GreetingCreator({ onShareCreated }: CreatorProps) {
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [language, setLanguage] = useState<GreetingLanguage>('en');
  const [tone, setTone] = useState<GreetingTone>('heartfelt');
  const [theme, setTheme] = useState<ThemeKey>('saffron');
  const [message, setMessage] = useState(() => buildDefaultMessage({ language: 'en', tone: 'heartfelt', senderName: '', receiverName: '' }));
  const [status, setStatus] = useState<Status>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES[theme];

  // when inputs that drive presets change, regenerate unless user edited
  const regeneratePreset = (lang: GreetingLanguage, t: GreetingTone, s: string, r: string) => {
    setMessage(buildDefaultMessage({ language: lang, tone: t, senderName: s, receiverName: r }));
  };

  const handleLang = (lang: GreetingLanguage) => {
    setLanguage(lang);
    regeneratePreset(lang, tone, senderName, receiverName);
  };
  const handleTone = (t: GreetingTone) => {
    setTone(t);
    regeneratePreset(language, t, senderName, receiverName);
  };
  const handleSender = (v: string) => {
    setSenderName(v);
  };
  const handleReceiver = (v: string) => {
    setReceiverName(v);
  };

  const writeWithAI = async () => {
    setAiLoading(true);
    audio.whoosh();
    try {
      // Gemini via Firebase AI Logic — Phase 2 feature.
      // For Phase 1 we fall back to a richer preset so the feature is usable.
      await new Promise((r) => setTimeout(r, 900));
      const s = senderName.trim() || 'a loved one';
      const r = receiverName.trim() || 'you';
      const flavour: Record<GreetingLanguage, string> = {
        en: `May the thousand lamps of Diwali chase every worry from your home, ${r}. Here's to a year lit with laughter, sweet as sandesh, warm as the Kolkata dusk. — With love, ${s}`,
        hi: `हजारों दीप तुम्हारे घर के हर फिक्र को मिटा दें, ${r}। एक ऐसा साल हो जो हँसी, मिठास और गर्मजोशी से भरा हो। — प्यार से, ${s}`,
        bn: `হাজার প্রদীপ তোমার ঘরের প্রতিটি চিন্তা দূর করুক, ${r}। এমন এক বছর হোক যা হাসি, মিষ্টি আর উষ্ণতায় ভরা। — ভালোবেসে, ${s}`,
      };
      setMessage(flavour[language]);
      audio.bell(880);
    } catch {
      regeneratePreset(language, tone, senderName, receiverName);
    } finally {
      setAiLoading(false);
    }
  };

  const createShareLink = async () => {
    if (!receiverName.trim() || !senderName.trim()) {
      setStatus('error');
      return;
    }
    setStatus('saving');
    audio.whoosh();
    try {
      const shortId = await saveGreeting({
        senderName: senderName.trim(),
        receiverName: receiverName.trim(),
        language,
        tone,
        theme,
        message: message.trim() || buildDefaultMessage({ language, tone, senderName, receiverName }),
      });
      const url = `${window.location.origin}/#/g/${shortId}`;
      setShareUrl(url);
      setStatus('saved');
      audio.bell(1100);
      onShareCreated?.(shortId);
    } catch {
      setStatus('error');
      audio.crumble();
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      audio.pop();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const shareNative = async () => {
    if (!shareUrl) return;
    const shareData = {
      title: 'Diwali Digital Diya',
      text: `${senderName} sent you a Diwali greeting`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  };

  const whatsappShare = () => {
    if (!shareUrl) return;
    const text = `${senderName} lit a diya for you this Diwali — open your greeting:`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`, '_blank', 'noopener');
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    audio.whoosh();
    try {
      await downloadElementAsImage(cardRef.current, `diwali-greeting-${(receiverName || 'diwali').toLowerCase().replace(/\s+/g, '-')}.png`);
      audio.pop();
    } catch {
      audio.crumble();
    }
  };

  const themeSwatches = useMemo(() => Object.values(THEMES), []);

  return (
    <section id="creator" className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
      <div className="mb-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-cinzel text-4xl font-bold text-gold-200 glow-text sm:text-5xl"
        >
          Craft Your Diwali Greeting
        </motion.h2>
        <p className="mx-auto mt-3 max-w-xl font-body text-gold-300/70">
          Personalise a luminous greeting, preview it live, and share a glowing link with someone you love.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,440px)]">
        {/* form */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="grid gap-5">
            <Field label="Your name (sender)">
              <input
                type="text"
                value={senderName}
                onChange={(e) => handleSender(e.target.value)}
                maxLength={40}
                placeholder="e.g. Subhajit"
                className="input"
                aria-label="Your name"
              />
            </Field>
            <Field label="Receiver's name">
              <input
                type="text"
                value={receiverName}
                onChange={(e) => handleReceiver(e.target.value)}
                maxLength={40}
                placeholder="e.g. Ananya"
                className="input"
                aria-label="Receiver's name"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Language">
                <select
                  value={language}
                  onChange={(e) => handleLang(e.target.value as GreetingLanguage)}
                  className="input"
                  aria-label="Greeting language"
                >
                  {(Object.entries(LANGUAGE_LABELS) as [GreetingLanguage, string][]).map(([k, v]) => (
                    <option key={k} value={k} className="bg-maroon-900">
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tone">
                <select
                  value={tone}
                  onChange={(e) => handleTone(e.target.value as GreetingTone)}
                  className="input"
                  aria-label="Greeting tone"
                >
                  {(Object.entries(TONE_LABELS) as [GreetingTone, string][]).map(([k, v]) => (
                    <option key={k} value={k} className="bg-maroon-900">
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Colour theme">
              <div className="flex flex-wrap gap-3">
                {themeSwatches.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTheme(t.key)}
                    aria-pressed={theme === t.key}
                    aria-label={t.label}
                    className={cn(
                      'relative h-12 w-12 rounded-full border-2 transition-all',
                      theme === t.key ? 'scale-110 border-gold-200' : 'border-white/20 hover:border-white/40',
                    )}
                    style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
                  >
                    {theme === t.key && (
                      <Check size={16} className="absolute inset-0 m-auto text-white" />
                    )}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Your message">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={400}
                  rows={5}
                  className="input resize-none"
                  aria-label="Greeting message"
                />
                <button
                  type="button"
                  onClick={writeWithAI}
                  disabled={aiLoading}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-100 ring-1 ring-indigo-300/40 transition hover:bg-indigo-500/50 disabled:opacity-60"
                  aria-label="Write a wish with AI"
                >
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                  Write with AI
                </button>
              </div>
              <p className="mt-1 text-right text-xs text-gold-300/50">{message.length}/400</p>
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={createShareLink}
              disabled={status === 'saving'}
              className="btn-primary"
            >
              {status === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {status === 'saved' ? 'Link ready!' : 'Create share link'}
            </button>
            {status === 'error' && (
              <p className="self-center text-sm text-rose-300">Please add both names to create a link.</p>
            )}
          </div>

          {shareUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-maroon-900/60 p-3"
            >
              <span className="flex-1 truncate font-mono text-xs text-gold-200">{shareUrl}</span>
              <button onClick={copyLink} className="btn-ghost !px-3 !py-2 text-xs" aria-label="Copy link">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={shareNative} className="btn-ghost !px-3 !py-2 text-xs" aria-label="Share link">
                <Share2 size={14} /> Share
              </button>
              <button onClick={whatsappShare} className="btn-ghost !px-3 !py-2 text-xs" aria-label="Share on WhatsApp">
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button onClick={downloadImage} className="btn-ghost !px-3 !py-2 text-xs" aria-label="Download as image">
                <Download size={14} /> Image
              </button>
            </motion.div>
          )}
        </div>

        {/* live preview */}
        <div className="flex flex-col items-center gap-4">
          <p className="font-body text-sm uppercase tracking-widest text-gold-300/60">Live preview</p>
          <div
            className="w-full max-w-[360px] overflow-hidden rounded-2xl"
            style={{ boxShadow: `0 0 50px ${activeTheme.glow}` }}
          >
            {/* scaled-down card via CSS transform on a 720-wide stage */}
            <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: 720, height: 960 }}>
              <GreetingCard
                ref={cardRef}
                senderName={senderName}
                receiverName={receiverName}
                message={message}
                language={language}
                theme={activeTheme}
              />
            </div>
          </div>
          <p className="text-center text-xs text-gold-300/50">A 2× version is generated when you download as an image.</p>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 210, 77, 0.18);
          background: rgba(26, 5, 8, 0.6);
          padding: 0.7rem 0.9rem;
          color: #fff6e6;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: rgba(255, 210, 77, 0.6);
          box-shadow: 0 0 0 3px rgba(255, 143, 13, 0.18);
        }
        .input::placeholder { color: rgba(255, 210, 77, 0.35); }
      `}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-sm font-medium text-gold-200">{label}</span>
      {children}
    </label>
  );
}
