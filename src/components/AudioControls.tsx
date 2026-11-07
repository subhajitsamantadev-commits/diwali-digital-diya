import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { audio } from '@/lib/audio';
import { cn } from '@/lib/utils';

/**
 * Always-visible mute toggle + volume slider, floating bottom-left.
 * Disabled until the audio engine has been started by a user gesture.
 */
export default function AudioControls({ enabled }: { enabled: boolean }) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    audio.setMuted(muted);
  }, [muted]);
  useEffect(() => {
    audio.setVolume(volume);
  }, [volume]);

  const Icon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <div
        className={cn(
          'glass flex items-center gap-1 rounded-full p-1.5 transition-all duration-300',
          !enabled && 'opacity-50',
        )}
      >
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          disabled={!enabled}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          aria-pressed={muted}
          className="grid h-10 w-10 place-items-center rounded-full text-gold-200 transition-colors hover:bg-gold-400/15 disabled:cursor-not-allowed"
        >
          <Icon size={18} />
        </button>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            open ? 'w-32 pr-2' : 'w-0',
          )}
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            disabled={!enabled || muted}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (muted && parseFloat(e.target.value) > 0) setMuted(false);
            }}
            aria-label="Volume"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-maroon-700 accent-saffron-400"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={!enabled}
          aria-label={open ? 'Hide volume slider' : 'Show volume slider'}
          aria-expanded={open}
          className="grid h-10 w-8 place-items-center rounded-full text-gold-300/70 transition-colors hover:text-gold-100 disabled:cursor-not-allowed"
        >
          <span className="text-[10px] font-semibold">{muted ? 'OFF' : `${Math.round((muted ? 0 : volume) * 100)}`}</span>
        </button>
      </div>
    </div>
  );
}
