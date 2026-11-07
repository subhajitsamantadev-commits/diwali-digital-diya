import type { GreetingLanguage, GreetingTone, GreetingInput } from './types';

const ADJECTIVES = ['diya', 'ravi', 'astra', 'noor', 'deep', 'jyot', 'udy', 'phul', 'rang', 'rosh'];
const NOUNS = ['mala', ' tara', 'priya', 'aakash', 'kiran', 'saroj', 'naman', 'kalpa', 'utsav', 'anand'];

export function generateShortId(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const b = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const n = Math.floor(Math.random() * 90 + 10);
  return `${a}${b}${n}`.replace(/\s/g, '');
}

const HEARTFELT: Record<GreetingLanguage, (s: string, r: string) => string> = {
  en: (s, r) =>
    `Dear ${r}, as lamps light up the sky, my heart wishes you a Diwali full of warmth, laughter and love. May every diya banish a shadow and every spark bring you hope. With all my heart — ${s}`,
  hi: (s, r) =>
    `प्रिय ${r}, जैसे ही दीप आकाश को रोशन करते हैं, मेरा दिल आपके लिए एक ऐसा दिवाली चाहता है जो गर्मजोशी, हँसी और प्यार से भरा हो। हर दीया एक अँधेरा मिटाए और हर चिंगारी आशा लाए। दिल से — ${s}`,
  bn: (s, r) =>
    `প্রিয় ${r}, প্রদীপ যখন আকাশ আলো করে, আমার মন তোমার জন্য এমন দীপাবলি কামনা করে যা আনন্দ, হাসি আর ভালোবাসায় ভরা। প্রতিটি দিয়া এক একটি অন্ধকার দূর করুক। ভালোবেসে — ${s}`,
};

const FUNNY: Record<GreetingLanguage, (s: string, r: string) => string> = {
  en: (s, r) =>
    `${r}! May your Diwali be brighter than your future and your sweets sweeter than your excuses. Burn calories, not just crackers. Loaded with love — ${s}`,
  hi: (s, r) =>
    `${r}! तुम्हारा दिवाली तुम्हारे भविष्य से ज्यादा रोशन हो और मिठाइयाँ तुम्हारे बहानों से मीठी। कैलोरी जलाओ, सिर्फ पटाखे नहीं। प्यार से — ${s}`,
  bn: (s, r) =>
    `${r}! তোমার দীপাবলি তোমার ভবিষ্যৎের চেয়ে উজ্জ্বল হোক, আর মিষ্টি তোমার অজুহাতের চেয়ে মিষ্টি। ক্যালোরি পোড়াও, শুধু পটকা নয়। ভালোবাসা — ${s}`,
};

const FORMAL: Record<GreetingLanguage, (s: string, r: string) => string> = {
  en: (s, r) =>
    `Warmest Diwali greetings to you, ${r}. May the festival of lights bring prosperity, good health and success to you and your loved ones. With sincere regards, ${s}`,
  hi: (s, r) =>
    `${r} को दीवाली की भवदीय शुभकामनाएँ। प्रकाश का यह त्योहार आपको और आपके परिजनों को समृद्धि, स्वास्थ्य और सफलता लाए। भवदीय, ${s}`,
  bn: (s, r) =>
    `${r}-কে দীপাবলির আন্তরিক শুভেচ্ছা। আলোর এই উৎসব আপনাকে ও আপনার পরিবারকে সমৃদ্ধি, সুস্বাস্থ্য ও সাফল্য এনে দিক। ভবদীয়, ${s}`,
};

const PRESETS: Record<GreetingTone, Record<GreetingLanguage, (s: string, r: string) => string>> = {
  heartfelt: HEARTFELT,
  funny: FUNNY,
  formal: FORMAL,
};

export function presetMessage(
  language: GreetingLanguage,
  tone: GreetingTone,
  sender: string,
  receiver: string,
): string {
  return PRESETS[tone][language](sender.trim() || 'A loved one', receiver.trim() || 'You');
}

export function buildDefaultMessage(input: Pick<GreetingInput, 'language' | 'tone' | 'senderName' | 'receiverName'>): string {
  return presetMessage(input.language, input.tone, input.senderName, input.receiverName);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
