import Link from 'next/link';

const services = [
  ['manikyur-samara', 'Маникюр', 'Без покрытия, коррекция и варианты дизайна.'],
  ['pedikyur-samara', 'Педикюр', 'Полный комплекс, экспресс и без покрытия.'],
  ['narashchivanie-nogtey-samara', 'Наращивание ногтей', 'Выбор длины, формы и последующая коррекция.'],
  ['dizayn-nogtey-samara', 'Дизайн ногтей', 'Френч, втирка, нюд и рисунки.'],
  ['tseny', 'Цены', 'Стоимость услуг и дополнительных работ.'],
  ['kontakty', 'Как добраться', 'Санфировой, 95/2, офис 616. Телефон и запись.'],
] as const;

export default function ServiceNavigation({ current }: { current?: string }) {
  return (
      <nav aria-label="Услуги и информация о студии" className="service-navigation-inline">
        {services.map(([slug, title]) => (
          <Link href={`/${slug}`} key={slug} aria-current={slug === current ? 'page' : undefined}>
            {title}
          </Link>
        ))}
      </nav>
  );
}
