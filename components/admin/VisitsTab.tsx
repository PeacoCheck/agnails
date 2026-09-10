'use client';

type Visit = {
  id: string;
  timestamp: string;
  ip: string;
  path: string;
  referer: string;
  device: string;
  browser: string;
};

type Stats = {
  total: number;
  today: number;
  uniqueIps: number;
  visits: Visit[];
};

function formatTs(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      timeZone: 'Europe/Samara',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function VisitsTab({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <section className="admin-card">
        <h2>Посещения</h2>
        <p className="hint">Загрузка…</p>
      </section>
    );
  }

  return (
    <section className="admin-card">
      <h2>Посещения сайта</h2>
      <p className="hint">Кто заходил на agnails.ru (без админки и API). Храним последние ~800 визитов.</p>
      <div className="admin-stats">
        <div className="admin-stat">
          <span>Всего</span>
          <b>{stats.total}</b>
        </div>
        <div className="admin-stat">
          <span>Сегодня</span>
          <b>{stats.today}</b>
        </div>
        <div className="admin-stat">
          <span>Уникальных IP</span>
          <b>{stats.uniqueIps}</b>
        </div>
      </div>
      <div className="admin-table-wrap" style={{ marginTop: 16, overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th align="left">Время (Самара)</th>
              <th align="left">IP</th>
              <th align="left">Страница</th>
              <th align="left">Устройство</th>
              <th align="left">Браузер</th>
              <th align="left">Откуда</th>
            </tr>
          </thead>
          <tbody>
            {stats.visits.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '12px 0', opacity: 0.7 }}>
                  Пока пусто — открой сайт в инкогнито, запись появится здесь.
                </td>
              </tr>
            ) : (
              stats.visits.slice(0, 200).map((v) => (
                <tr key={v.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <td style={{ padding: '8px 8px 8px 0', whiteSpace: 'nowrap' }}>{formatTs(v.timestamp)}</td>
                  <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace' }}>{v.ip}</td>
                  <td style={{ padding: 8 }}>{v.path}</td>
                  <td style={{ padding: 8 }}>{v.device}</td>
                  <td style={{ padding: 8 }}>{v.browser}</td>
                  <td style={{ padding: 8, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.referer || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
