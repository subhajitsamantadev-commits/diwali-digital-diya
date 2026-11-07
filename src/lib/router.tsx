import { useEffect, useState } from 'react';
import { Link } from 'lucide-react';

export function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center px-6 text-center">
      <div className="glass-strong max-w-lg rounded-3xl p-10">
        <p className="font-cinzel text-6xl font-bold text-gold-200 glow-text">404</p>
        <p className="mt-4 font-display text-2xl text-saffron-200">This page went dark</p>
        <p className="mt-3 font-body text-gold-300/70">
          The diya you're looking for isn't here. Let's guide you back to the festival.
        </p>
        <a href="/#/" className="btn-primary mt-6 inline-flex">
          <Link size={16} /> Return home
        </a>
      </div>
    </div>
  );
}

/**
 * Lightweight hash-based router.
 * Routes:
 *   #/         -> home
 *   #/create   -> creator
 *   #/g/<id>   -> receiver greeting
 */
export type Route = { name: 'home' } | { name: 'create' } | { name: 'greeting'; shortId: string } | { name: 'notfound' };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'create') return { name: 'create' };
  if (parts[0] === 'g' && parts[1]) return { name: 'greeting', shortId: parts[1] };
  return { name: 'notfound' };
}

export function useRouter(): { route: Route; navigate: (to: string) => void } {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return { route, navigate };
}
