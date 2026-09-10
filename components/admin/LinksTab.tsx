'use client';

import type { SiteContent } from '@/lib/site-content-schema';
import { Field } from './fields';

export default function LinksTab({
  content,
  setContent,
}: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
}) {
  const setLink = (key: keyof SiteContent['links'], value: string) => {
    setContent({ ...content, links: { ...content.links, [key]: value } });
  };

  return (
    <section className="admin-card">
      <h2>Ссылки</h2>
      <p className="hint">DIKIDI, соцсети и карты. WhatsApp обычно wa.me/номер.</p>
      <div className="admin-grid">
        <Field label="DIKIDI">
          <input value={content.links.dikidi} onChange={(e) => setLink('dikidi', e.target.value)} />
        </Field>
        <Field label="ВКонтакте">
          <input value={content.links.vk} onChange={(e) => setLink('vk', e.target.value)} />
        </Field>
        <Field label="Telegram">
          <input value={content.links.telegram} onChange={(e) => setLink('telegram', e.target.value)} />
        </Field>
        <Field label="WhatsApp">
          <input value={content.links.whatsapp} onChange={(e) => setLink('whatsapp', e.target.value)} />
        </Field>
        <Field label="MAX">
          <input value={content.links.max} onChange={(e) => setLink('max', e.target.value)} />
        </Field>
        <Field label="Яндекс.Карты">
          <input value={content.links.yandexMaps} onChange={(e) => setLink('yandexMaps', e.target.value)} />
        </Field>
        <Field label="Виджет карты">
          <input value={content.links.yandexMapWidget} onChange={(e) => setLink('yandexMapWidget', e.target.value)} />
        </Field>
      </div>
    </section>
  );
}
