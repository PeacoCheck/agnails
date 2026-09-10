type Review = {
  id?: string;
  name: string;
  text: string;
  rating?: number;
  service?: string;
};

type Props = {
  reviews: Review[];
  ratingValue: string;
  /** visual speed preset */
  speed?: 'normal' | 'slow';
  className?: string;
};

function clip(text: string, max = 96) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export default function ReviewsMarquee({
  reviews,
  ratingValue,
  speed = 'normal',
  className = '',
}: Props) {
  const items = reviews.filter((r) => r.text?.trim()).slice(0, 8);
  if (items.length === 0) return null;

  const loop = [...items, ...items];
  const rootClass = ['reviews-marquee', speed === 'slow' ? 'is-slow' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} aria-label={`Отзывы клиентов, рейтинг ${ratingValue}`}>
      <div className="reviews-marquee-track">
        {loop.map((review, index) => (
          <article
            className="reviews-marquee-card"
            key={`${review.id || review.name}-${index}`}
            aria-hidden={index >= items.length}
          >
            <span className="reviews-marquee-stars">{'★'.repeat(Math.min(5, review.rating || 5))}</span>
            <p>“{clip(review.text)}”</p>
            <footer>
              <b>{review.name}</b>
              {review.service ? <span>{review.service}</span> : null}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
