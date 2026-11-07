import { useEffect } from 'react';

interface MetaConfig {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Updates document title + Open Graph / Twitter meta for share previews. */
export function useDocumentMeta(config: MetaConfig) {
  useEffect(() => {
    document.title = config.title;
    if (config.description) setMeta('name', 'description', config.description);
    if (config.ogTitle) setMeta('property', 'og:title', config.ogTitle);
    if (config.ogDescription) setMeta('property', 'og:description', config.ogDescription);
    if (config.ogImage) {
      setMeta('property', 'og:image', config.ogImage);
      setMeta('name', 'twitter:image', config.ogImage);
    }
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:card', 'summary_large_image');
  }, [config.title, config.description, config.ogTitle, config.ogDescription, config.ogImage]);
}
