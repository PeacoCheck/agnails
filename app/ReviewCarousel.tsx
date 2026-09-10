'use client';

import { useRef } from 'react';

type Review = {
  name: string;
  date: string;
  service: string;
  text: string;
  rating: number;
};

export default function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * 0.86, 420), behavior: 'smooth' });
  };

  return (
    <div className="carousel-wrap reviews-carousel">
      <button type="button" className="carousel-arrow prev" onClick={() => move(-1)} aria-label="Предыдущие отзывы">
        ←
      </button>
      <button type="button" className="carousel-arrow next" onClick={() => move(1)} aria-label="Следующие отзывы">
        →
      </button>
      <div className="review-list" ref={trackRef}>
        {reviews.map((review) => (
          <article key={`${review.name}-${review.service}-${review.date}`}>
            <div className="stars">{'★'.repeat(review.rating || 5)}</div>
            <p>“{review.text}”</p>
            <footer>
              <b>{review.name}</b>
              <span>{review.service} · {review.date}</span>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
