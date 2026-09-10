'use client';

import type { SiteContent } from '@/lib/site-content-schema';
import { Field } from './fields';

export default function ContentTab({
  content,
  setContent,
}: {
  content: SiteContent;
  setContent: (next: SiteContent) => void;
}) {
  return (
    <>
      <section className="admin-card">
        <h2>Телефон, часы и рейтинг</h2>
        <p className="hint">Эти поля сразу попадают в шапку, запись и JSON-LD.</p>
        <div className="admin-grid">
          <Field label="Телефон (как на сайте)">
            <input
              value={content.business.phoneDisplay}
              onChange={(e) => setContent({ ...content, business: { ...content.business, phoneDisplay: e.target.value } })}
            />
          </Field>
          <Field label="Часы работы">
            <input
              value={content.business.workingHours.label}
              onChange={(e) => setContent({
                ...content,
                business: { ...content.business, workingHours: { ...content.business.workingHours, label: e.target.value } },
              })}
            />
          </Field>
          <Field label="Имя мастера">
            <input
              value={content.business.masterName}
              onChange={(e) => setContent({ ...content, business: { ...content.business, masterName: e.target.value } })}
            />
          </Field>
          <Field label="Рейтинг">
            <input
              value={content.business.rating.value}
              onChange={(e) => setContent({
                ...content,
                business: { ...content.business, rating: { ...content.business.rating, value: e.target.value } },
              })}
            />
          </Field>
          <Field label="Количество оценок">
            <input
              type="number"
              value={content.business.rating.ratingCount}
              onChange={(e) => setContent({
                ...content,
                business: { ...content.business, rating: { ...content.business.rating, ratingCount: Number(e.target.value) } },
              })}
            />
          </Field>
          <Field label="Количество отзывов">
            <input
              type="number"
              value={content.business.rating.reviewCount}
              onChange={(e) => setContent({
                ...content,
                business: { ...content.business, rating: { ...content.business.rating, reviewCount: Number(e.target.value) } },
              })}
            />
          </Field>
        </div>
      </section>

      <section className="admin-card">
        <h2>Адрес</h2>
        <div className="admin-grid">
          <Field label="Короткий адрес">
            <input
              value={content.business.address.shortAddress}
              onChange={(e) => setContent({
                ...content,
                business: { ...content.business, address: { ...content.business.address, shortAddress: e.target.value } },
              })}
            />
          </Field>
          <Field label="Полный адрес">
            <input
              value={content.business.address.streetAddress}
              onChange={(e) => setContent({
                ...content,
                business: { ...content.business, address: { ...content.business.address, streetAddress: e.target.value } },
              })}
            />
          </Field>
          <Field label="Детали (этаж / офис)">
            <input
              value={content.business.address.details}
              onChange={(e) => setContent({
                ...content,
                business: { ...content.business, address: { ...content.business.address, details: e.target.value } },
              })}
            />
          </Field>
          <Field label="Ориентир">
            <input
              value={content.business.address.landmark}
              onChange={(e) => setContent({
                ...content,
                business: { ...content.business, address: { ...content.business.address, landmark: e.target.value } },
              })}
            />
          </Field>
        </div>
      </section>

      <section className="admin-card">
        <h2>Hero и заголовки секций</h2>
        <div className="admin-grid">
          <Field label="Надзаголовок">
            <input value={content.hero.eyebrow} onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrow: e.target.value } })} />
          </Field>
          <Field label="Заголовок, строка 1">
            <input value={content.hero.titleLine1} onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleLine1: e.target.value } })} />
          </Field>
          <Field label="Заголовок, строка 2">
            <input value={content.hero.titleLine2} onChange={(e) => setContent({ ...content, hero: { ...content.hero, titleLine2: e.target.value } })} />
          </Field>
          <Field label="Описание hero">
            <textarea value={content.hero.description} onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })} />
          </Field>
          <Field label="Работы — заголовок">
            <input value={content.copy.worksTitle} onChange={(e) => setContent({ ...content, copy: { ...content.copy, worksTitle: e.target.value } })} />
          </Field>
          <Field label="Работы — текст">
            <input value={content.copy.worksDescription} onChange={(e) => setContent({ ...content, copy: { ...content.copy, worksDescription: e.target.value } })} />
          </Field>
          <Field label="Цены — заголовок">
            <input value={content.copy.pricesTitle} onChange={(e) => setContent({ ...content, copy: { ...content.copy, pricesTitle: e.target.value } })} />
          </Field>
          <Field label="Цены — текст">
            <input value={content.copy.pricesDescription} onChange={(e) => setContent({ ...content, copy: { ...content.copy, pricesDescription: e.target.value } })} />
          </Field>
          <Field label="Адрес — заголовок">
            <input value={content.copy.locationTitle} onChange={(e) => setContent({ ...content, copy: { ...content.copy, locationTitle: e.target.value } })} />
          </Field>
          <Field label="Адрес — текст">
            <input value={content.copy.locationDescription} onChange={(e) => setContent({ ...content, copy: { ...content.copy, locationDescription: e.target.value } })} />
          </Field>
          <Field label="Запись — заголовок">
            <input value={content.copy.bookingTitle} onChange={(e) => setContent({ ...content, copy: { ...content.copy, bookingTitle: e.target.value } })} />
          </Field>
          <Field label="Запись — текст">
            <input value={content.copy.bookingDescription} onChange={(e) => setContent({ ...content, copy: { ...content.copy, bookingDescription: e.target.value } })} />
          </Field>
          <Field label="Подвал">
            <input value={content.copy.footerText} onChange={(e) => setContent({ ...content, copy: { ...content.copy, footerText: e.target.value } })} />
          </Field>
        </div>
      </section>
    </>
  );
}
