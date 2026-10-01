'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const key = 'ag_visit_beacon';
      const last = sessionStorage.getItem(key);
      const path = window.location.pathname + window.location.search;
      if (last === path) return;
      sessionStorage.setItem(key, path);
      void fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          referer: document.referrer || '',
        }),
        keepalive: true,
      });
    } catch {
      // ignore
    }
  }, [pathname]);

  return null;
}
