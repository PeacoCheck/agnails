'use client';

import type { PromoCode, ActivationLog } from '@/lib/promo-service';
import { Field } from './fields';

export default function PromosTab({
  promos,
  promoLogs,
  bannedIps,
  promoStats,
  newPromoCode,
  newPromoDiscount,
  newPromoMaxUses,
  newPromoDikidiUrl,
  isCreatingPromo,
  promoFilter,
  promoSearch,
  manualIpToBan,
  onNewPromoCode,
  onNewPromoDiscount,
  onNewPromoMaxUses,
  onNewPromoDikidiUrl,
  onCreatePromo,
  onTogglePromo,
  onDeletePromo,
  onBanIp,
  onUnbanIp,
  onManualIp,
  onManualBanSubmit,
  onFilter,
  onSearch,
  onRefresh,
}: {
  promos: PromoCode[];
  promoLogs: ActivationLog[];
  bannedIps: string[];
  promoStats: {
    totalActivations: number;
    successfulActivations: number;
    fraudAttempts: number;
    suspiciousAttempts: number;
    bannedIpsCount: number;
  };
  newPromoCode: string;
  newPromoDiscount: string;
  newPromoMaxUses: string;
  newPromoDikidiUrl: string;
  isCreatingPromo: boolean;
  promoFilter: 'all' | 'high' | 'medium' | 'low';
  promoSearch: string;
  manualIpToBan: string;
  onNewPromoCode: (value: string) => void;
  onNewPromoDiscount: (value: string) => void;
  onNewPromoMaxUses: (value: string) => void;
  onNewPromoDikidiUrl: (value: string) => void;
  onCreatePromo: (e: React.FormEvent) => void;
  onTogglePromo: (code: string) => void;
  onDeletePromo: (code: string) => void;
  onBanIp: (ip: string) => void;
  onUnbanIp: (ip: string) => void;
  onManualIp: (value: string) => void;
  onManualBanSubmit: (e: React.FormEvent) => void;
  onFilter: (value: 'all' | 'high' | 'medium' | 'low') => void;
  onSearch: (value: string) => void;
  onRefresh: () => void;
}) {
  const filteredLogs = promoLogs.filter((log) => {
    if (promoFilter === 'high' && log.riskLevel !== 'high') return false;
    if (promoFilter === 'medium' && log.riskLevel !== 'medium') return false;
    if (promoFilter === 'low' && log.riskLevel !== 'low') return false;
    if (promoSearch) {
      const q = promoSearch.toLowerCase();
      return log.ip.toLowerCase().includes(q) || log.code.toLowerCase().includes(q) || log.userAgent.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <section className="admin-card">
        <div className="admin-toolbar">
          <div>
            <h2>Промокоды</h2>
            <p className="hint">Создание кодов, статистика и журнал активаций.</p>
          </div>
          <button type="button" className="admin-btn ghost tiny" onClick={onRefresh}>Обновить</button>
        </div>
        <div className="admin-stats">
          <div className="admin-stat"><span>Всего попыток</span><b>{promoStats.totalActivations}</b></div>
          <div className="admin-stat"><span>Успешных</span><b>{promoStats.successfulActivations}</b></div>
          <div className="admin-stat"><span>Повторные</span><b>{promoStats.suspiciousAttempts}</b></div>
          <div className="admin-stat"><span>Заблокировано IP</span><b>{bannedIps.length}</b></div>
        </div>

        <form onSubmit={onCreatePromo} className="admin-upload">
          <h3 style={{ margin: 0, fontSize: 14 }}>Создать промокод</h3>
          <div className="admin-grid">
            <Field label="Код">
              <input value={newPromoCode} onChange={(e) => onNewPromoCode(e.target.value.toUpperCase())} placeholder="HELLO" required />
            </Field>
            <Field label="Скидка">
              <input value={newPromoDiscount} onChange={(e) => onNewPromoDiscount(e.target.value)} placeholder="Скидка 10% на первый визит" required />
            </Field>
            <Field label="Лимит активаций">
              <input type="number" value={newPromoMaxUses} onChange={(e) => onNewPromoMaxUses(e.target.value)} placeholder="100" />
            </Field>
            <Field label="DIKIDI URL (опц.)">
              <input value={newPromoDikidiUrl} onChange={(e) => onNewPromoDikidiUrl(e.target.value)} placeholder="https://dikidi.net/..." />
            </Field>
          </div>
          <button className="admin-btn" type="submit" disabled={isCreatingPromo || !newPromoCode.trim()}>
            {isCreatingPromo ? 'Создание...' : 'Добавить промокод'}
          </button>
        </form>

        {promos.map((p) => (
          <div className="admin-promo-item" key={p.code}>
            <div>
              <b>{p.code}</b>
              <span className="admin-muted"> — {p.discount}</span>
              <span className="admin-badge low" style={{ marginLeft: 8 }}>
                {p.usedCount}{p.maxUses ? ` / ${p.maxUses}` : ''}
              </span>
            </div>
            <div className="admin-row">
              <button type="button" className="admin-btn tiny" onClick={() => onTogglePromo(p.code)}>
                {p.active ? 'Активен' : 'Выключен'}
              </button>
              <button type="button" className="admin-btn danger tiny" onClick={() => onDeletePromo(p.code)}>Удалить</button>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-card">
        <h2>Журнал активаций</h2>
        <p className="hint">Повторный ввод за день разрешён. Повтор через месяц или ручной бан блокирует скидку.</p>
        {bannedIps.length > 0 && (
          <div className="admin-chips" style={{ marginBottom: 14 }}>
            {bannedIps.map((ip) => (
              <span className="admin-chip" key={ip}>
                {ip}
                <button type="button" className="admin-btn ghost tiny" onClick={() => onUnbanIp(ip)}>✕</button>
              </span>
            ))}
          </div>
        )}
        <div className="admin-filters">
          <form onSubmit={onManualBanSubmit} className="admin-row">
            <input className="admin-input" value={manualIpToBan} onChange={(e) => onManualIp(e.target.value)} placeholder="Забанить IP..." />
            <button type="submit" className="admin-btn danger tiny">Бан</button>
          </form>
          <input className="admin-input" value={promoSearch} onChange={(e) => onSearch(e.target.value)} placeholder="Поиск по IP / коду..." />
          <select value={promoFilter} onChange={(e) => onFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}>
            <option value="all">Все попытки</option>
            <option value="high">Высокий риск</option>
            <option value="medium">Средний риск</option>
            <option value="low">Низкий риск</option>
          </select>
        </div>
        {filteredLogs.length === 0 ? (
          <p className="admin-muted">Пока нет зафиксированных попыток активации.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Код</th>
                  <th>IP</th>
                  <th>Риск</th>
                  <th>Поведение</th>
                  <th>Результат</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const isIpBanned = log.isBanned || bannedIps.includes(log.ip);
                  const level = isIpBanned || log.riskLevel === 'high' ? 'high' : log.riskLevel;
                  return (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td><code>{log.code}</code></td>
                      <td><code>{log.ip}</code></td>
                      <td><span className={`admin-badge ${level}`}>{isIpBanned ? 'бан' : log.riskLevel}</span></td>
                      <td>{log.riskReasons.join('; ')}</td>
                      <td>{log.success ? 'скидка' : 'отклонено'}</td>
                      <td>
                        {isIpBanned ? (
                          <button type="button" className="admin-btn tiny" onClick={() => onUnbanIp(log.ip)}>Разбанить</button>
                        ) : (
                          <button type="button" className="admin-btn danger tiny" onClick={() => onBanIp(log.ip)}>Забанить</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
