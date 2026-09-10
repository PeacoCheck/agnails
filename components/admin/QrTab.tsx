'use client';

export type QrTheme = 'nude' | 'dark';

export type QrStatsView = {
  totalScans: number;
  uniqueVisitors: number;
  scansToday: number;
  scansThisWeek: number;
  devices: { ios: number; android: number; other: number };
  sources: Record<string, number>;
  logs: Array<{
    id: string;
    timestamp: string;
    ip: string;
    device: string;
    browser: string;
    source: string;
    referer?: string;
  }>;
};

const SOURCE_LABELS: Record<string, string> = {
  mirror: 'Зеркало',
  stand: 'Стойка',
  card: 'Визитка',
};

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildPrintStandHtml(svg: string, theme: QrTheme) {
  const isNude = theme === 'nude';
  const gold = '#c4a574';
  const paper = isNude ? '#f4eee6' : '#0b0b0c';
  const card = isNude ? '#fffdf9' : '#141415';
  const ink = isNude ? '#2b2420' : '#eeeae4';
  const muted = isNude ? '#7a6e66' : '#8c8984';
  const line = isNude ? 'rgba(196,165,116,0.45)' : 'rgba(196,165,116,0.32)';
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>AG Nails — QR-стойка</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: ${paper}; color: ${ink}; }
    body { font-family: Manrope, system-ui, sans-serif; }
    .sheet {
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    }
    .panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18mm 16mm;
      position: relative;
    }
    .panel.back { transform: rotate(180deg); }
    .fold {
      height: 0;
      border-top: 1px dashed ${line};
    }
    .card {
      width: 118mm;
      min-height: 118mm;
      padding: 10mm 9mm 9mm;
      border-radius: 8mm;
      background: ${card};
      border: 1px solid ${line};
      text-align: center;
    }
    .kicker {
      color: ${gold};
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
    }
    h1 {
      margin: 6px 0 4px;
      font-family: "Cormorant Garamond", serif;
      font-size: 34px;
      font-weight: 500;
    }
    .hint { margin: 0 0 10px; color: ${muted}; font-size: 12px; }
    .qr {
      width: 68mm;
      margin: 0 auto 10px;
      padding: 5mm;
      background: #fff;
      border-radius: 5mm;
    }
    .qr svg { width: 100%; height: auto; display: block; }
    .meta { color: ${muted}; font-size: 11px; line-height: 1.55; }
    .meta b { color: ${ink}; font-weight: 700; }
    @media print { .noprint { display: none !important; } }
    .noprint {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 10;
    }
    .noprint button {
      min-height: 40px;
      padding: 0 16px;
      border: 0;
      border-radius: 12px;
      background: ${gold};
      color: #0b0b0c;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">Печать</button></div>
  <div class="sheet">
    <div class="panel back">${cardInner(svg, gold)}</div>
    <div class="fold"></div>
    <div class="panel front">${cardInner(svg, gold)}</div>
  </div>
</body>
</html>`;
}

function cardInner(svg: string, gold: string) {
  return `
      <div class="card">
        <div class="kicker">AG Nails · Самара</div>
        <h1>Сканируйте для записи</h1>
        <p class="hint">Камера телефона откроет сайт и онлайн-запись</p>
        <div class="qr">${svg}</div>
        <div class="meta">
          <b>ул. Санфировой, 95/2</b> · офис 616<br />
          +7 977 053 11 89 · ежедневно 8:00–23:00<br />
          <span style="color:${gold}">agnails.ru</span>
        </div>
      </div>`;
}

function openPrintStand(svg: string, theme: QrTheme) {
  const html = buildPrintStandHtml(svg, theme);
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) {
    downloadBlob(`ag-nails-qr-stand-${theme}.html`, new Blob([html], { type: 'text/html;charset=utf-8' }));
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export default function QrTab({
  stats,
  svg,
  dataUrl,
  targetUrl,
  theme,
  isLoading,
  onThemeChange,
  onRefresh,
}: {
  stats: QrStatsView | null;
  svg: string;
  dataUrl: string;
  targetUrl: string;
  theme: QrTheme;
  isLoading: boolean;
  onThemeChange: (theme: QrTheme) => void;
  onRefresh: () => void;
}) {
  const total = stats?.totalScans ?? 0;
  const unique = stats?.uniqueVisitors ?? 0;
  const today = stats?.scansToday ?? 0;
  const week = stats?.scansThisWeek ?? 0;
  const devices = stats?.devices ?? { ios: 0, android: 0, other: 0 };
  const sources = stats?.sources ?? {};
  const logs = stats?.logs ?? [];

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ag-nails-qr-${theme}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadSvg = () => {
    if (!svg) return;
    downloadBlob(`ag-nails-qr-${theme}.svg`, new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  };

  const downloadStandHtml = () => {
    if (!svg) return;
    downloadBlob(
      `ag-nails-qr-stand-${theme}.html`,
      new Blob([buildPrintStandHtml(svg, theme)], { type: 'text/html;charset=utf-8' }),
    );
  };

  return (
    <>
      <section className="admin-card">
        <div className="admin-toolbar">
          <div>
            <h2>QR и аналитика</h2>
            <p className="hint">Сканы через /qr с UTM. Код ведёт на {targetUrl || 'https://agnails.ru/qr'}.</p>
          </div>
          <button type="button" className="admin-btn ghost tiny" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? 'Загрузка...' : 'Обновить'}
          </button>
        </div>

        <div className="admin-stats">
          <div className="admin-stat"><span>Всего сканов</span><b>{total}</b></div>
          <div className="admin-stat"><span>Уникальных</span><b>{unique}</b></div>
          <div className="admin-stat"><span>Сегодня</span><b>{today}</b></div>
          <div className="admin-stat"><span>За неделю</span><b>{week}</b></div>
        </div>

        <div className="admin-qr-layout">
          <div>
            <div className="admin-qr-preview" aria-label="Предпросмотр QR">
              {svg ? (
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              ) : dataUrl ? (
                <img src={dataUrl} alt="QR AG Nails" />
              ) : (
                <p className="admin-muted">QR ещё не загружен</p>
              )}
            </div>
            <div className="admin-qr-actions">
              <button type="button" className="admin-btn tiny" onClick={downloadPng} disabled={!dataUrl}>PNG</button>
              <button type="button" className="admin-btn tiny" onClick={downloadSvg} disabled={!svg}>SVG</button>
              <button type="button" className="admin-btn ghost tiny" onClick={() => svg && openPrintStand(svg, theme)} disabled={!svg}>
                Печать стойки
              </button>
              <button type="button" className="admin-btn ghost tiny" onClick={downloadStandHtml} disabled={!svg}>
                HTML стойки
              </button>
            </div>
          </div>

          <div>
            <div className="admin-grid">
              <label className="admin-field">
                <span>Тема QR</span>
                <select value={theme} onChange={(e) => onThemeChange(e.target.value as QrTheme)}>
                  <option value="nude">nude — золото</option>
                  <option value="dark">dark — графит</option>
                </select>
              </label>
              <label className="admin-field">
                <span>Трекинг URL</span>
                <input className="admin-input" value={targetUrl} readOnly />
              </label>
            </div>

            <div className="admin-stats" style={{ marginTop: 16 }}>
              <div className="admin-stat"><span>iOS</span><b>{devices.ios}</b></div>
              <div className="admin-stat"><span>Android</span><b>{devices.android}</b></div>
              <div className="admin-stat"><span>Другие</span><b>{devices.other}</b></div>
            </div>

            <div style={{ marginTop: 8 }}>
              <p className="hint" style={{ marginBottom: 8 }}>Источники</p>
              <div className="admin-chips">
                {Object.keys(sources).length === 0 ? (
                  <span className="admin-muted">Пока нет сканов</span>
                ) : (
                  Object.entries(sources).map(([key, count]) => (
                    <span className="admin-chip" key={key} style={{ color: '#eeeae4', borderColor: 'color-mix(in oklab, #c4a574 40%, transparent)' }}>
                      {SOURCE_LABELS[key] || key}: {count}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h2>Журнал сканов</h2>
        <p className="hint">Последние переходы по QR. IP используется для уникальных посетителей.</p>
        {logs.length === 0 ? (
          <p className="admin-muted">Сканов пока нет.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Источник</th>
                  <th>Устройство</th>
                  <th>Браузер</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 40).map((log) => (
                  <tr key={log.id}>
                    <td>
                      {new Date(log.timestamp).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Europe/Samara',
                      })}
                    </td>
                    <td>{SOURCE_LABELS[log.source] || log.source}</td>
                    <td>{log.device}</td>
                    <td>{log.browser}</td>
                    <td><code>{log.ip}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
