export type GreetingLanguage = 'en' | 'hi' | 'bn';
export type GreetingTone = 'heartfelt' | 'funny' | 'formal';
export type ThemeKey = 'saffron' | 'maroon' | 'indigo' | 'gold';

export interface GreetingInput {
  senderName: string;
  receiverName: string;
  language: GreetingLanguage;
  tone: GreetingTone;
  theme: ThemeKey;
  message: string;
}

export interface Greeting extends GreetingInput {
  shortId: string;
  createdAt: string;
}

export interface Theme {
  key: ThemeKey;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  background: string;
  text: string;
}

export const THEMES: Record<ThemeKey, Theme> = {
  saffron: {
    key: 'saffron',
    label: 'Saffron Glow',
    primary: '#ff8f0d',
    secondary: '#ffd24d',
    accent: '#ffe4b8',
    glow: 'rgba(255,143,13,0.45)',
    background: 'linear-gradient(160deg,#2a080d 0%,#3a0c12 40%,#1a0508 100%)',
    text: '#fff6e6',
  },
  maroon: {
    key: 'maroon',
    label: 'Maroon Ritual',
    primary: '#c64a55',
    secondary: '#e08a91',
    accent: '#ffd24d',
    glow: 'rgba(198,74,85,0.45)',
    background: 'linear-gradient(160deg,#1a0508 0%,#4f1018 50%,#2a080d 100%)',
    text: '#fbeaec',
  },
  indigo: {
    key: 'indigo',
    label: 'Indigo Night',
    primary: '#5c6bff',
    secondary: '#8a97ff',
    accent: '#ffd24d',
    glow: 'rgba(92,107,255,0.45)',
    background: 'linear-gradient(160deg,#070828 0%,#161a5c 50%,#0d0f3a 100%)',
    text: '#eef0ff',
  },
  gold: {
    key: 'gold',
    label: 'Golden Aura',
    primary: '#f5c428',
    secondary: '#ffe080',
    accent: '#ff8f0d',
    glow: 'rgba(245,196,40,0.5)',
    background: 'linear-gradient(160deg,#3a1c00 0%,#5c2b00 45%,#1a0508 100%)',
    text: '#fff9e6',
  },
};

export const LANGUAGE_LABELS: Record<GreetingLanguage, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  bn: 'বাংলা (Bengali)',
};

export const TONE_LABELS: Record<GreetingTone, string> = {
  heartfelt: 'Heartfelt',
  funny: 'Funny',
  formal: 'Formal',
};

export const LANGUAGE_GREETINGS: Record<GreetingLanguage, string> = {
  en: 'Happy Diwali',
  hi: 'दीवाली की शुभकामनाएँ',
  bn: 'দীপাবলির শুভেচ্ছা',
};
