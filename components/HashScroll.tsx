'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PATH_TO_ID: Record<string, string> = {
  '/prices': 'prices',
  '/price': 'prices',
  '/prajs': 'prices',
  '/works': 'works',
  '/reviews': 'reviews',
  '/location': 'location',
};

const HASH_IDS = new Set(['prices', 'works', 'reviews', 'location', 'top']);

function sectionIdFromLocation(): string | null {
  const hash = window.location.hash.replace(/^#/, '').trim();
  if (hash && HASH_IDS.has(hash)) return hash;

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return PATH_TO_ID[path] ?? null;
}

function scrollToSection(id: string): boolean {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'auto' });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'auto', block: 'start' });
  return true;
}

export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const run = () => {
      const id = sectionIdFromLocation();
      if (!id) return;
      scrollToSection(id);
    };

    run();
    const raf = requestAnimationFrame(run);
    const t1 = window.setTimeout(run, 50);
    const t2 = window.setTimeout(run, 200);
    const t3 = window.setTimeout(run, 600);

    window.addEventListener('hashchange', run);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('hashchange', run);
    };
  }, [pathname]);

  return null;
}
