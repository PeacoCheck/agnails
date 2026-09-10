'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import type { SiteContent } from '@/lib/site-content-schema';
import type { PromoCode, ActivationLog } from '@/lib/promo-service';
import AdminLogin from './AdminLogin';
import SaveBar from './SaveBar';
import OverviewTab from './OverviewTab';
import ContentTab from './ContentTab';
import GalleryTab from './GalleryTab';
import PricesTab from './PricesTab';
import ReviewsTab from './ReviewsTab';
import PromosTab from './PromosTab';
import LinksTab from './LinksTab';
import QrTab from './QrTab';
import VisitsTab from './VisitsTab';
import type { QrStatsView, QrTheme } from './QrTab';
import './admin.css';

const TABS = [
  { id: 'overview', label: 'Обзор' },
  { id: 'content', label: 'Контент' },
  { id: 'gallery', label: 'Галерея' },
  { id: 'prices', label: 'Прайс' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'promos', label: 'Промокоды' },
  { id: 'qr', label: 'QR' },
  { id: 'visits', label: 'Посещения' },
  { id: 'links', label: 'Ссылки' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<TabId>('overview');

  const [content, setContent] = useState<SiteContent | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [promoLogs, setPromoLogs] = useState<ActivationLog[]>([]);
  const [bannedIps, setBannedIps] = useState<string[]>([]);
  const [manualIpToBan, setManualIpToBan] = useState('');
  const [promoStats, setPromoStats] = useState({
    totalActivations: 0,
    successfulActivations: 0,
    fraudAttempts: 0,
    suspiciousAttempts: 0,
    bannedIpsCount: 0,
  });

  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [newPromoMaxUses, setNewPromoMaxUses] = useState('');
  const [newPromoDikidiUrl, setNewPromoDikidiUrl] = useState('');
  const [promoFilter, setPromoFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [promoSearch, setPromoSearch] = useState('');
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);

  const [qrTheme, setQrTheme] = useState<QrTheme>('nude');
  const [qrStats, setQrStats] = useState<QrStatsView | null>(null);
  const [qrSvg, setQrSvg] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrTargetUrl, setQrTargetUrl] = useState('https://agnails.ru/qr');
  const [qrLoading, setQrLoading] = useState(false);
  const [visitStats, setVisitStats] = useState<{
    total: number;
    today: number;
    uniqueIps: number;
    visits: Array<{
      id: string;
      timestamp: string;
      ip: string;
      path: string;
      referer: string;
      device: string;
      browser: string;
    }>;
  } | null>(null);

  const previewUrl = useMemo(() => (uploadFile ? URL.createObjectURL(uploadFile) : null), [uploadFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);


  const fetchQr = async (nextTheme: QrTheme = 'nude') => {
    setQrLoading(true);
    try {
      const res = await fetch(`/api/admin/qr?theme=${nextTheme}`);
      if (res.ok) {
        const data = await res.json();
        setQrStats(data.stats || null);
        setQrSvg(data.qr?.svg || '');
        setQrDataUrl(data.qr?.dataUrl || '');
        if (data.qr?.targetUrl) setQrTargetUrl(data.qr.targetUrl);
        if (data.qr?.theme === 'nude' || data.qr?.theme === 'dark') {
          setQrTheme(data.qr.theme);
        } else {
          setQrTheme(nextTheme);
        }
      }
    } catch {
      // ignore
    } finally {
      setQrLoading(false);
    }
  };

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/admin/visits');
      if (res.ok) {
        const data = await res.json();
        setVisitStats(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      if (res.ok) {
        const data = await res.json();
        setPromos(data.promos || []);
        setPromoLogs(data.logs || []);
        if (data.bannedIps) setBannedIps(data.bannedIps);
        if (data.stats) setPromoStats(data.stats);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          fetchPromos();
          fetchQr('nude');
          fetchVisits();
          return res.json();
        }
        setIsAuthenticated(false);
        return null;
      })
      .then((data) => {
        if (data) setContent(data);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setLoginError(data.error || 'Неверный пароль');
          return;
        }
        setIsAuthenticated(true);
        const contentRes = await fetch('/api/admin/content');
        if (contentRes.ok) setContent(await contentRes.json());
        fetchPromos();
        fetchQr('nude');
      } catch {
        setLoginError('Ошибка сети при входе.');
      }
    });
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setContent(null);
  };

  const handleSave = async () => {
    if (!content) return;
    setSaveStatus('saving');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveStatus('error');
        setErrorMessage(data.error || 'Ошибка при сохранении');
        return;
      }
      setContent(data.content);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setErrorMessage('Сетевая ошибка при сохранении');
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle || 'Работа мастера');
      formData.append('alt', uploadAlt || uploadTitle || 'Маникюр AG Nails');
      const res = await fetch('/api/admin/upload-photo', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Ошибка при загрузке фото');
        setIsUploading(false);
        return;
      }
      const contentRes = await fetch('/api/admin/content');
      if (contentRes.ok) setContent(await contentRes.json());
      setUploadFile(null);
      setUploadTitle('');
      setUploadAlt('');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setErrorMessage('Сетевая ошибка при загрузке фото');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim() || !newPromoDiscount.trim()) return;
    setIsCreatingPromo(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_promo',
          code: newPromoCode,
          discount: newPromoDiscount,
          maxUses: newPromoMaxUses ? Number(newPromoMaxUses) : undefined,
          dikidiUrl: newPromoDikidiUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Ошибка при создании промокода');
      } else {
        setPromos(data.promos);
        setNewPromoCode('');
        setNewPromoDiscount('');
        setNewPromoMaxUses('');
        setNewPromoDikidiUrl('');
        fetchPromos();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setErrorMessage('Сетевая ошибка при создании промокода');
    } finally {
      setIsCreatingPromo(false);
    }
  };

  const handleTogglePromo = async (code: string) => {
    const updated = promos.map((p) => (p.code === code ? { ...p, active: !p.active } : p));
    setPromos(updated);
    await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_promos', promos: updated }),
    });
  };

  const handleDeletePromo = async (code: string) => {
    if (!confirm(`Удалить промокод ${code}?`)) return;
    const updated = promos.filter((p) => p.code !== code);
    setPromos(updated);
    await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_promos', promos: updated }),
    });
  };

  const handleBanIp = async (ip: string) => {
    if (!confirm(`Заблокировать использование промокодов для IP ${ip}?`)) return;
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban_ip', ip }),
      });
      if (res.ok) {
        const data = await res.json();
        setBannedIps(data.bannedIps || []);
        setPromoLogs(data.logs || []);
        fetchPromos();
      }
    } catch {
      // ignore
    }
  };

  const handleUnbanIp = async (ip: string) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban_ip', ip }),
      });
      if (res.ok) {
        const data = await res.json();
        setBannedIps(data.bannedIps || []);
        setPromoLogs(data.logs || []);
        fetchPromos();
      }
    } catch {
      // ignore
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="admin-root admin-login">
        <p className="admin-muted">Загрузка панели управления...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        password={password}
        loginError={loginError}
        isPending={isPending}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  if (!content) {
    return (
      <div className="admin-root admin-login">
        <p className="admin-muted">Загрузка данных сайта...</p>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div>
            <div className="kicker">AG Nails</div>
            <h1>Панель управления</h1>
          </div>
          <div className="admin-header-actions">
            <a className="admin-btn ghost" href="/" target="_blank" rel="noreferrer">Открыть сайт ↗</a>
            <button type="button" className="admin-btn ghost" onClick={handleLogout}>Выйти</button>
          </div>
        </div>
        <div className="admin-header-inner">
          <nav className="admin-tabs" aria-label="Разделы админки">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? 'active' : ''}
                onClick={() => {
                  setTab(item.id);
                  if (item.id === 'visits') void fetchVisits();
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="admin-main">
        {errorMessage && <div className="admin-error">{errorMessage}</div>}
        {tab === 'overview' && (
          <OverviewTab
            content={content}
            promoStats={promoStats}
            bannedCount={bannedIps.length}
            worksCount={content.works.length}
            onOpenTab={(next) => setTab(next as TabId)}
          />
        )}
        {tab === 'content' && <ContentTab content={content} setContent={setContent} />}
        {tab === 'gallery' && (
          <GalleryTab
            content={content}
            setContent={setContent}
            uploadFile={uploadFile}
            uploadTitle={uploadTitle}
            uploadAlt={uploadAlt}
            isUploading={isUploading}
            previewUrl={previewUrl}
            onFileChange={setUploadFile}
            onTitleChange={setUploadTitle}
            onAltChange={setUploadAlt}
            onUpload={handleUploadPhoto}
            onDelete={(index) => setContent({ ...content, works: content.works.filter((_, i) => i !== index) })}
            onMove={(index, direction) => {
              const target = index + direction;
              if (target < 0 || target >= content.works.length) return;
              const works = [...content.works];
              const [item] = works.splice(index, 1);
              works.splice(target, 0, item);
              setContent({ ...content, works });
            }}
          />
        )}
        {tab === 'prices' && <PricesTab content={content} setContent={setContent} />}
        {tab === 'reviews' && (
          <ReviewsTab
            content={content}
            setContent={setContent}
            onAdd={() => setContent({
              ...content,
              reviews: [
                { name: 'Новый клиент', date: 'Сегодня', service: 'Маникюр', text: 'Прекрасная работа, идеальное покрытие и форма!', rating: 5 },
                ...content.reviews,
              ],
            })}
            onDelete={(index) => setContent({ ...content, reviews: content.reviews.filter((_, i) => i !== index) })}
          />
        )}
        {tab === 'promos' && (
          <PromosTab
            promos={promos}
            promoLogs={promoLogs}
            bannedIps={bannedIps}
            promoStats={promoStats}
            newPromoCode={newPromoCode}
            newPromoDiscount={newPromoDiscount}
            newPromoMaxUses={newPromoMaxUses}
            newPromoDikidiUrl={newPromoDikidiUrl}
            isCreatingPromo={isCreatingPromo}
            promoFilter={promoFilter}
            promoSearch={promoSearch}
            manualIpToBan={manualIpToBan}
            onNewPromoCode={setNewPromoCode}
            onNewPromoDiscount={setNewPromoDiscount}
            onNewPromoMaxUses={setNewPromoMaxUses}
            onNewPromoDikidiUrl={setNewPromoDikidiUrl}
            onCreatePromo={handleCreatePromo}
            onTogglePromo={handleTogglePromo}
            onDeletePromo={handleDeletePromo}
            onBanIp={handleBanIp}
            onUnbanIp={handleUnbanIp}
            onManualIp={setManualIpToBan}
            onManualBanSubmit={(e) => {
              e.preventDefault();
              if (!manualIpToBan.trim()) return;
              handleBanIp(manualIpToBan.trim());
              setManualIpToBan('');
            }}
            onFilter={setPromoFilter}
            onSearch={setPromoSearch}
            onRefresh={fetchPromos}
          />
        )}

        {tab === 'visits' && <VisitsTab stats={visitStats} />}
        {tab === 'qr' && (
          <QrTab
            stats={qrStats}
            svg={qrSvg}
            dataUrl={qrDataUrl}
            targetUrl={qrTargetUrl}
            theme={qrTheme}
            isLoading={qrLoading}
            onThemeChange={(next) => {
              setQrTheme(next);
              fetchQr(next);
            }}
            onRefresh={() => fetchQr(qrTheme)}
          />
        )}
        {tab === 'links' && <LinksTab content={content} setContent={setContent} />}
      </main>

      <SaveBar saveStatus={saveStatus} errorMessage={errorMessage} onSave={handleSave} />
    </div>
  );
}
