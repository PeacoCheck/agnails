'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function MetrikaPageViews({ id }: { id: number }) {
  const pathname = usePathname();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const url = window.location.href;
    const referer = previousUrl.current;
    previousUrl.current = url;
    // Initialization already records the first view.
    if (!referer || referer === url) return;
    window.ym?.(id, 'hit', url, { referer, title: document.title });
  }, [id, pathname]);

  return null;
}
