import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { audio } from '@/lib/audio';
import { useVisibilityPause } from '@/hooks/useCanvas';
import { useDocumentMeta } from '@/hooks/useMeta';
import { useRouter, NotFound } from '@/lib/router';
import NightSky from '@/components/NightSky';
import Intro from '@/components/Intro';
import AudioControls from '@/components/AudioControls';
import HomeExperience from '@/components/HomeExperience';
import GreetingCreator from '@/components/GreetingCreator';
import ReceiverPage from '@/components/ReceiverPage';
import Footer from '@/components/Footer';

export default function App() {
  const [entered, setEntered] = useState(false);
  const { route, navigate } = useRouter();

  useDocumentMeta({
    title: 'Diwali Digital Diya — Light the Festival',
    description:
      'A premium Diwali greeting experience: light diyas, launch fireworks, and send glowing personalised greetings in English, Hindi and Bengali.',
    ogTitle: 'Diwali Digital Diya',
    ogDescription:
      'Light a diya, launch a firework, and send a luminous Diwali greeting across the night sky. Made with love by Subhajit Samanta.',
  });

  // pause audio engine when tab hidden
  useVisibilityPause(
    () => audio.pause(),
    () => {
      if (entered) audio.resume();
    },
  );

  const handleEnter = useCallback(() => {
    setEntered(true);
  }, []);

  const goCreate = useCallback(() => {
    navigate('/create');
    setTimeout(() => {
      const el = document.getElementById('creator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, [navigate]);

  return (
    <div className="grain relative min-h-screen w-full overflow-x-hidden">
      <NightSky />

      <AnimatePresence>{!entered && <Intro onEnter={handleEnter} />}</AnimatePresence>

      {entered && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {route.name === 'home' && <HomeExperience onStartCreating={goCreate} />}
          {route.name === 'create' && (
            <>
              <HomeExperience onStartCreating={goCreate} />
              <GreetingCreator onShareCreated={(id) => navigate(`/g/${id}`)} />
            </>
          )}
          {route.name === 'greeting' && (
            <ReceiverPage shortId={route.shortId} onSendBack={goCreate} />
          )}
          {route.name === 'notfound' && <NotFound />}

          {route.name !== 'greeting' && <Footer />}
        </motion.main>
      )}

      <AudioControls enabled={entered} />
    </div>
  );
}
