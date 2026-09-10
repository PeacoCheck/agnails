type Work = {
  id?: string;
  src: string;
  title: string;
  alt: string;
};

type Props = {
  works: Work[];
};

export default function WorksMarquee({ works }: Props) {
  const items = works.filter((w) => w.src);
  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div className="works-marquee" aria-label="Галерея работ">
      <div className="works-marquee-track">
        {loop.map((work, index) => {
          const num = String((index % items.length) + 1).padStart(2, '0');
          return (
            <figure
              className="work-card works-marquee-card"
              key={`${work.id || work.src}-${index}`}
              aria-hidden={index >= items.length}
            >
              <img
                src={work.src}
                alt={work.alt || work.title}
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <figcaption>
                <b>{work.title}</b>
                <span>{num}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
