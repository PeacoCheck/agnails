'use client';

import { useRef } from 'react';

export type WorkItem =
  | { src: string; title: string; alt: string }
  | [src: string, title: string, alt: string];

export default function WorkGallery({ works }: { works: WorkItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * 0.82, 460), behavior: 'smooth' });
  };

  return (
    <>
      <div className="gallery-tools">
        <span>Листайте работы</span>
        <div>
          <button type="button" onClick={() => move(-1)} aria-label="Предыдущие работы">←</button>
          <button type="button" onClick={() => move(1)} aria-label="Следующие работы">→</button>
        </div>
      </div>
      <div className="work-track" ref={trackRef}>
        {works.map((item, index) => {
          const src = Array.isArray(item) ? item[0] : item.src;
          const title = Array.isArray(item) ? item[1] : item.title;
          const alt = Array.isArray(item) ? item[2] : item.alt;
          const num = String(index + 1).padStart(2, '0');

          return (
            <figure key={`${src}-${index}`} className="work-card">
              <img
                src={src}
                alt={alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <figcaption>
                <b>{title}</b>
                <span>{num}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </>
  );
}

