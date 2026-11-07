import { Heart } from 'lucide-react';
import { AlponaBorder } from './Alpona';

export default function Footer() {
  return (
    <footer className="relative mt-10 border-t border-gold-400/10 px-6 py-12 text-center">
      <AlponaBorder className="mx-auto mb-8 h-10 w-72 opacity-50" />
      <p className="font-cinzel text-lg font-semibold text-gold-200">Diwali Digital Diya</p>
      <p className="mx-auto mt-3 max-w-md font-body text-sm text-gold-300/60">
        A luminous Diwali greeting experience — diyas, fireworks, and wishes across the night sky.
      </p>
      <p className="mt-4 text-xs text-gold-300/50">Powered by Firebase and Gemini</p>
      <p className="mt-2 inline-flex items-center gap-1.5 font-body text-sm text-gold-200">
        Made with <Heart size={13} className="fill-rose-400 text-rose-400" /> by Subhajit Samanta
      </p>
    </footer>
  );
}
