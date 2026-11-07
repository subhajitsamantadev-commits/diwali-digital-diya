# Diwali Digital Diya

A premium, cinematic Diwali greeting experience — light diyas, launch fireworks, craft personalised greetings in English, Hindi and Bengali, and share glowing links with loved ones.

## Features

- **Tap-to-light intro** — light the first diya to wake the festival (and start audio).
- **Interactive fireworks** — tap anywhere to launch a rocket; shapes include ring, heart, flower and the word DIWALI. A sparkler trail follows your finger/cursor.
- **Five tap-to-light diyas** — light all five to trigger a grand finale.
- **Greeting creator** — sender/receiver names, language (English / Hindi / Bengali), tone (heartfelt / funny / formal), four colour themes, live preview, and a "Surprise wish" generator.
- **Shareable greeting page** — each greeting gets a unique short link; the receiver sees their name in glowing sparkler letters, the message types in, diyas light one by one, and fireworks burst.
- **Share actions** — WhatsApp, native Share, Copy link, and Download as image.
- **Synthesised audio** — ambient Indian-scale melody, bell, whoosh, boom and confetti pop, all built with the Web Audio API. Mute toggle and volume slider always visible.
- **Open Graph tags** — links preview nicely when shared.
- **Responsive & accessible** — mobile-first from 360px to 4K, keyboard navigation, aria labels, visible focus, and `prefers-reduced-motion` support.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS (custom festive theme)
- Framer Motion (animations & micro-interactions)
- HTML Canvas (night sky, fireworks, sparklers)
- Web Audio API (all sound synthesised in-browser)
- Supabase (greeting link storage — no login required)
- Lucide React (icons)

## Run Locally

```bash
npm install
npm run dev
```

Then open the printed local URL.

### Environment

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

The app works without these (greeting sharing is disabled), but to create and open shareable greeting links they must be set.

## Deployment

```bash
npm run build
```

The `dist/` folder is a static site you can host anywhere (Firebase Hosting, Netlify, Vercel, GitHub Pages, etc.). No server runtime is required — the database is accessed directly from the browser via the Supabase client.

## Project Structure

```
src/
  components/    UI components (Diya, Fireworks, GreetingCard, Intro, etc.)
  hooks/         Reusable hooks (canvas, meta, reduced motion)
  lib/           Core logic (audio, supabase, greetings API, utils, router)
  App.tsx        App shell + routing
  main.tsx       Entry point
  index.css      Global styles & theme
public/
  diya.svg       Favicon
```

## Credits

Made with love by Subhajit Samanta.
