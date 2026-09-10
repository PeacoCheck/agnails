'use client';

import type { SiteContent } from '@/lib/site-content-schema';
import { Field } from './fields';

export default function ReviewsTab({
  content,
  setContent,
  onAdd,
  onDelete,
}: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
}) {
  return (
    <section className="admin-card">
      <div className="admin-toolbar">
        <div>
          <h2>Отзывы</h2>
          <p className="hint">Тексты на сайте. Рейтинг в карточке слева задаётся в разделе «Контент».</p>
        </div>
        <button type="button" className="admin-btn" onClick={onAdd}>+ Добавить отзыв</button>
      </div>
      <div style={{ display: 'grid', gap: 14 }}>
        {content.reviews.map((review, idx) => (
          <div key={idx} className="admin-card" style={{ background: '#101011', margin: 0 }}>
            <div className="admin-grid">
              <Field label="Имя">
                <input
                  value={review.name}
                  onChange={(e) => {
                    const reviews = [...content.reviews];
                    reviews[idx] = { ...reviews[idx], name: e.target.value };
                    setContent({ ...content, reviews });
                  }}
                />
              </Field>
              <Field label="Услуга">
                <input
                  value={review.service}
                  onChange={(e) => {
                    const reviews = [...content.reviews];
                    reviews[idx] = { ...reviews[idx], service: e.target.value };
                    setContent({ ...content, reviews });
                  }}
                />
              </Field>
              <Field label="Дата">
                <input
                  value={review.date}
                  onChange={(e) => {
                    const reviews = [...content.reviews];
                    reviews[idx] = { ...reviews[idx], date: e.target.value };
                    setContent({ ...content, reviews });
                  }}
                />
              </Field>
              <Field label="Оценка">
                <select
                  value={review.rating || 5}
                  onChange={(e) => {
                    const reviews = [...content.reviews];
                    reviews[idx] = { ...reviews[idx], rating: Number(e.target.value) };
                    setContent({ ...content, reviews });
                  }}
                >
                  <option value="5">5 звёзд</option>
                  <option value="4">4 звезды</option>
                  <option value="3">3 звезды</option>
                </select>
              </Field>
            </div>
            <div style={{ marginTop: 12 }}>
              <Field label="Текст">
                <textarea
                  value={review.text}
                  onChange={(e) => {
                    const reviews = [...content.reviews];
                    reviews[idx] = { ...reviews[idx], text: e.target.value };
                    setContent({ ...content, reviews });
                  }}
                />
              </Field>
            </div>
            <button type="button" className="admin-btn danger tiny" style={{ marginTop: 10 }} onClick={() => onDelete(idx)}>
              Удалить отзыв
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
