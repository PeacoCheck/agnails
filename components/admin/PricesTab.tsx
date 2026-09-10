'use client';

import type { SiteContent } from '@/lib/site-content-schema';
import { Field } from './fields';

export default function PricesTab({
  content,
  setContent,
}: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
}) {
  const updateGroups = (priceGroups: SiteContent['priceGroups']) => setContent({ ...content, priceGroups });

  return (
    <section className="admin-card">
      <h2>Прайс-лист</h2>
      <p className="hint">Можно добавлять категории и услуги. Пустые категории сохранять нельзя.</p>
      {content.priceGroups.map((group, gIdx) => (
        <div key={gIdx} className="admin-card" style={{ background: '#101011', marginBottom: 14 }}>
          <Field label="Категория">
            <input
              value={group.title}
              onChange={(e) => {
                const next = [...content.priceGroups];
                next[gIdx] = { ...next[gIdx], title: e.target.value };
                updateGroups(next);
              }}
            />
          </Field>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {group.items.map((item, iIdx) => (
              <div className="admin-row" key={iIdx}>
                <input
                  value={item.name}
                  onChange={(e) => {
                    const next = [...content.priceGroups];
                    const items = [...next[gIdx].items];
                    items[iIdx] = { ...items[iIdx], name: e.target.value };
                    next[gIdx] = { ...next[gIdx], items };
                    updateGroups(next);
                  }}
                  placeholder="Название услуги"
                />
                <input
                  value={item.price}
                  onChange={(e) => {
                    const next = [...content.priceGroups];
                    const items = [...next[gIdx].items];
                    items[iIdx] = { ...items[iIdx], price: e.target.value };
                    next[gIdx] = { ...next[gIdx], items };
                    updateGroups(next);
                  }}
                  placeholder="Цена"
                />
                <button
                  type="button"
                  className="admin-btn danger tiny"
                  onClick={() => {
                    const next = [...content.priceGroups];
                    next[gIdx] = { ...next[gIdx], items: next[gIdx].items.filter((_, i) => i !== iIdx) };
                    updateGroups(next);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="admin-row" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="admin-btn ghost tiny"
              onClick={() => {
                const next = [...content.priceGroups];
                next[gIdx] = { ...next[gIdx], items: [...next[gIdx].items, { name: 'Новая услуга', price: '1500 ₽' }] };
                updateGroups(next);
              }}
            >
              + Услуга
            </button>
            <button
              type="button"
              className="admin-btn danger tiny"
              onClick={() => updateGroups(content.priceGroups.filter((_, i) => i !== gIdx))}
            >
              Удалить категорию
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn ghost"
        onClick={() => updateGroups([...content.priceGroups, { title: 'Новая категория', items: [{ name: 'Новая услуга', price: '1500 ₽' }] }])}
      >
        + Добавить категорию
      </button>
      <div style={{ marginTop: 18 }}>
        <Field label="Примечание к прайсу">
          <input
            value={content.copy.priceNote}
            onChange={(e) => setContent({ ...content, copy: { ...content.copy, priceNote: e.target.value } })}
          />
        </Field>
      </div>
    </section>
  );
}
