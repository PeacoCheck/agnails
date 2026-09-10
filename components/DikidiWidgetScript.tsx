'use client';

import Script from 'next/script';
import { DIKIDI_WIDGET_SCRIPT } from '@/lib/dikidi-widget';

export default function DikidiWidgetScript() {
  return (
    <Script
      src={DIKIDI_WIDGET_SCRIPT}
      strategy="afterInteractive"
    />
  );
}
