'use client';

import type { SiteContent } from '@/lib/site-content-schema';

export default function OverviewTab({
  content,
  promoStats,
  bannedCount,
  worksCount,
  onOpenTab,
}: {
  content: SiteContent;
  promoStats: {
    totalActivations: number;
    successfulActivations: number;
    fraudAttempts: number;
    suspiciousAttempts: number;
    bannedIpsCount: number;
  };
  bannedCount: number;
  worksCount: number;
  onOpenTab: (tab: string) => void;
}) {
  return (
    <>
      <section className="admin-card">
        <h2>Обзор студии</h2>
        <p className="hint">{content.business.name} · {content.business.masterName} · {content.business.city}</p>
        <div className="admin-stats">
          <div className="admin-stat">
            <span>Телефон</span>
            <b>{content.business.phoneDisplay}</b>
          </div>
          <div className="admin-stat">
            <span>Часы</span>
            <b>{content.business.workingHours.label}</b>
          </div>
          <div className="admin-stat">
            <span>Рейтинг</span>
            <b>{content.business.rating.value}</b>
          </div>
          <div className="admin-stat">
            <span>Работ в галерее</span>
            <b>{worksCount}</b>
          </div>
        </div>
        <div className="admin-stats">
          <div className="admin-stat">
            <span>Промо-попыток</span>
            <b>{promoStats.totalActivations}</b>
          </div>
          <div className="admin-stat">
            <span>Успешных скидок</span>
            <b>{promoStats.successfulActivations}</b>
          </div>
          <div className="admin-stat">
            <span>Повторные</span>
            <b>{promoStats.suspiciousAttempts}</b>
          </div>
          <div className="admin-stat">
            <span>Заблокировано IP</span>
            <b>{bannedCount}</b>
          </div>
        </div>
        <p className="admin-muted">{content.business.address.streetAddress}</p>
        <div className="admin-row" style={{ marginTop: 16 }}>
          <button type="button" className="admin-btn ghost tiny" onClick={() => onOpenTab('content')}>Контент</button>
          <button type="button" className="admin-btn ghost tiny" onClick={() => onOpenTab('gallery')}>Галерея</button>
          <button type="button" className="admin-btn ghost tiny" onClick={() => onOpenTab('promos')}>Промокоды</button>
        </div>
      </section>
    </>
  );
}
