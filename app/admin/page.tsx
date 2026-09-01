'use client';

import { useState, useEffect, useTransition } from 'react';
import type { SiteContent } from '@/lib/site-content-schema';
import type { PromoCode, ActivationLog } from '@/lib/promo-service';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isPending, startTransition] = useTransition();

  const [content, setContent] = useState<SiteContent | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Promo codes & ML Fraud state
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
  const [promoFilter, setPromoFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [promoSearch, setPromoSearch] = useState('');
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);

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
    } catch {}
  };

  // Load content & promos if session exists
  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          fetchPromos();
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
        if (contentRes.ok) {
          setContent(await contentRes.json());
        }
        fetchPromos();
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

      const res = await fetch('/api/admin/upload-photo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Ошибка при загрузке фото');
        setIsUploading(false);
        return;
      }
      const contentRes = await fetch('/api/admin/content');
      if (contentRes.ok) {
        setContent(await contentRes.json());
      }
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

  const handleDeleteWork = (indexToDelete: number) => {
    if (!content) return;
    const newWorks = content.works.filter((_, i) => i !== indexToDelete);
    setContent({ ...content, works: newWorks });
  };

  const handleAddPriceItem = (groupIndex: number) => {
    if (!content) return;
    const newGroups = [...content.priceGroups];
    newGroups[groupIndex].items.push({ name: 'Новая услуга', price: '1500 ₽' });
    setContent({ ...content, priceGroups: newGroups });
  };

  const handleDeletePriceItem = (groupIndex: number, itemIndex: number) => {
    if (!content) return;
    const newGroups = [...content.priceGroups];
    newGroups[groupIndex].items = newGroups[groupIndex].items.filter((_, i) => i !== itemIndex);
    setContent({ ...content, priceGroups: newGroups });
  };

  const handleAddReview = () => {
    if (!content) return;
    const newReviews = [
      {
        name: 'Новый клиент',
        date: 'Сегодня',
        service: 'Маникюр',
        text: 'Прекрасная работа, идеальное покрытие и форма!',
        rating: 5,
      },
      ...content.reviews,
    ];
    setContent({ ...content, reviews: newReviews });
  };

  const handleDeleteReview = (indexToDelete: number) => {
    if (!content) return;
    const newReviews = content.reviews.filter((_, i) => i !== indexToDelete);
    setContent({ ...content, reviews: newReviews });
  };

  // Promo Handlers
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
    } catch {}
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
    } catch {}
  };

  const handleManualBanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIpToBan.trim()) return;
    handleBanIp(manualIpToBan.trim());
    setManualIpToBan('');
  };

  // Filtered promo logs
  const filteredLogs = promoLogs.filter((log) => {
    if (promoFilter === 'high' && log.riskLevel !== 'high') return false;
    if (promoFilter === 'medium' && log.riskLevel !== 'medium') return false;
    if (promoFilter === 'low' && log.riskLevel !== 'low') return false;
    if (promoSearch) {
      const q = promoSearch.toLowerCase();
      return (
        log.ip.toLowerCase().includes(q) ||
        log.code.toLowerCase().includes(q) ||
        log.userAgent.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f5f7', fontFamily: 'sans-serif' }}>
        <p>Загрузка панели управления...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f5f7', fontFamily: 'sans-serif', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 380, background: '#fff', padding: 32, borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1d1d1f' }}>AG Nails · Вход</h1>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: '#6e6e73' }}>Введите пароль администратора для управления сайтом.</p>
          
          {loginError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontSize: 13 }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid #d2d2d7',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                background: '#1d1d1f',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Проверка...' : 'Войти в панель'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f5f7', fontFamily: 'sans-serif' }}>
        <p>Загрузка данных сайта...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'sans-serif', paddingBottom: 100 }}>
      {/* Top Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e5e7', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#a67f70', letterSpacing: '0.06em' }}>AG Nails</span>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1d1d1f' }}>Панель управления сайтом</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{ padding: '8px 14px', borderRadius: 10, background: '#f0f0f2', color: '#1d1d1f', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              Открыть сайт ↗
            </a>
            <button
              onClick={handleLogout}
              style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', border: '1px solid #d2d2d7', color: '#6e6e73', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1080, margin: '24px auto', padding: '0 20px' }}>
        {errorMessage && (
          <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 12, background: '#fee2e2', color: '#b91c1c', fontSize: 14 }}>
            {errorMessage}
          </div>
        )}

        {/* Section 1: Contacts & Hours */}
        <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>📞 Телефон и часы работы</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
                Телефон (отображение на сайте)
              </label>
              <input
                type="text"
                value={content.business.phoneDisplay}
                onChange={(e) => setContent({ ...content, business: { ...content.business, phoneDisplay: e.target.value } })}
                placeholder="+7 999 123-45-67"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
                Часы работы
              </label>
              <input
                type="text"
                value={content.business.workingHours.label}
                onChange={(e) => setContent({ ...content, business: { ...content.business, workingHours: { ...content.business.workingHours, label: e.target.value } } })}
                placeholder="Пн–Вс: 10:00–20:00"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
                Ссылка на запись в DIKIDI
              </label>
              <input
                type="text"
                value={content.links.dikidi}
                onChange={(e) => setContent({ ...content, links: { ...content.links, dikidi: e.target.value } })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Social Networks & Messengers */}
        <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>🌐 Социальные сети и мессенджеры</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
                ВКонтакте (VK)
              </label>
              <input
                type="text"
                value={content.links.vk}
                onChange={(e) => setContent({ ...content, links: { ...content.links, vk: e.target.value } })}
                placeholder="https://vk.com/ag_nails_bz"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
                Telegram
              </label>
              <input
                type="text"
                value={content.links.telegram}
                onChange={(e) => setContent({ ...content, links: { ...content.links, telegram: e.target.value } })}
                placeholder="https://t.me/agnailsdz"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
                WhatsApp
              </label>
              <input
                type="text"
                value={content.links.whatsapp}
                onChange={(e) => setContent({ ...content, links: { ...content.links, whatsapp: e.target.value } })}
                placeholder="https://wa.me/70000000000"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
                MAX (профиль / салон)
              </label>
              <input
                type="text"
                value={content.links.max}
                onChange={(e) => setContent({ ...content, links: { ...content.links, max: e.target.value } })}
                placeholder="https://max.ru/ag_nails_smr"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
                Ссылка на Яндекс.Карты
              </label>
              <input
                type="text"
                value={content.links.yandexMaps}
                onChange={(e) => setContent({ ...content, links: { ...content.links, yandexMaps: e.target.value } })}
                placeholder="https://yandex.ru/maps/..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Promo Codes & Anti-Fraud Scanner */}
        <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>🎟️ Промокоды и Антифрод-мониторинг</h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6e6e73' }}>
                Создание промокодов, отслеживание повторных активаций и ручная блокировка/разрешение IP-адресов.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchPromos}
              style={{ padding: '6px 12px', borderRadius: 8, background: '#f0f0f2', border: 'none', color: '#1d1d1f', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              🔄 Обновить данные
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Всего попыток</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{promoStats.totalActivations}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Успешных скидок</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d', marginTop: 4 }}>{promoStats.successfulActivations}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#854d0e', textTransform: 'uppercase' }}>Повторные визиты (🟡)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309', marginTop: 4 }}>{promoStats.suspiciousAttempts}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#991b1b', textTransform: 'uppercase' }}>Заблокировано IP (🚫)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>{bannedIps.length}</div>
            </div>
          </div>

          {/* Create Promo Form */}
          <form onSubmit={handleCreatePromo} style={{ border: '1px solid #e5e5e7', borderRadius: 12, padding: 16, marginBottom: 20, background: '#fafafc' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>+ Создать новый промокод</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6e6e73', marginBottom: 4 }}>Код (например: WELCOME)</label>
                <input
                  type="text"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  placeholder="HELLO15"
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 13, textTransform: 'uppercase', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6e6e73', marginBottom: 4 }}>Описание скидки</label>
                <input
                  type="text"
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(e.target.value)}
                  placeholder="Скидка 15% на первый визит"
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6e6e73', marginBottom: 4 }}>Лимит активаций (опц.)</label>
                <input
                  type="number"
                  value={newPromoMaxUses}
                  onChange={(e) => setNewPromoMaxUses(e.target.value)}
                  placeholder="100"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isCreatingPromo || !newPromoCode.trim()}
                  style={{ width: '100%', padding: '9px 16px', borderRadius: 8, background: '#1d1d1f', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {isCreatingPromo ? 'Создание...' : 'Добавить промокод'}
                </button>
              </div>
            </div>
          </form>

          {/* Active Promos List */}
          <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>Действующие промокоды:</h3>
          <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
            {promos.map((p) => (
              <div key={p.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e5e7', background: p.active ? '#fff' : '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: p.active ? '#1d1d1f' : '#9ca3af', letterSpacing: '0.04em' }}>{p.code}</span>
                  <span style={{ fontSize: 13, color: '#4b5563' }}>— {p.discount}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: '#f3f4f6', color: '#6b7280' }}>
                    Использовано: {p.usedCount} {p.maxUses ? `/ ${p.maxUses}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePromo(p.code)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: 'none',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: p.active ? '#dcfce7' : '#f3f4f6',
                      color: p.active ? '#15803d' : '#6b7280',
                    }}
                  >
                    {p.active ? 'Активен ✓' : 'Выключен ✕'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePromo(p.code)}
                    style={{ padding: '4px 8px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', border: 'none', fontSize: 11, cursor: 'pointer' }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Banned IPs Bar */}
          {bannedIps.length > 0 && (
            <div style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 14, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
                🚫 Заблокированные IP-адреса ({bannedIps.length}):
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {bannedIps.map((bIp) => (
                  <span
                    key={bIp}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#fff',
                      border: '1px solid #fca5a5',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: '#b91c1c',
                    }}
                  >
                    {bIp}
                    <button
                      type="button"
                      onClick={() => handleUnbanIp(bIp)}
                      title="Разблокировать IP"
                      style={{ border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12, padding: 0 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ML Fraud Scanner Logs */}
          <div style={{ borderTop: '1px solid #e5e5e7', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>
                  🛡️ Журнал активаций клиентов
                </h3>
                <span style={{ fontSize: 11, color: '#6e6e73' }}>
                  Повторный ввод за 1 день разрешён. При повторе через месяц или ручном бане скидка блокируется.
                </span>
              </div>
              
              {/* Filter Controls */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <form onSubmit={handleManualBanSubmit} style={{ display: 'flex', gap: 4 }}>
                  <input
                    type="text"
                    placeholder="Забанить IP..."
                    value={manualIpToBan}
                    onChange={(e) => setManualIpToBan(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 12, width: 110 }}
                  />
                  <button
                    type="submit"
                    style={{ padding: '4px 8px', borderRadius: 6, background: '#dc2626', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Бан
                  </button>
                </form>
                <input
                  type="text"
                  placeholder="Поиск по IP / коду..."
                  value={promoSearch}
                  onChange={(e) => setPromoSearch(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 12 }}
                />
                <select
                  value={promoFilter}
                  onChange={(e) => setPromoFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 12 }}
                >
                  <option value="all">Все попытки</option>
                  <option value="high">🔴 Заблокированные / Фрод</option>
                  <option value="medium">🟡 Повторные за сегодня</option>
                  <option value="low">🟢 Чистые (Новые клиенты)</option>
                </select>
              </div>
            </div>

            {/* Logs Table */}
            {filteredLogs.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '14px 0' }}>Пока нет зафиксированных попыток активации.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '8px 10px' }}>Время</th>
                      <th style={{ padding: '8px 10px' }}>Код</th>
                      <th style={{ padding: '8px 10px' }}>IP-адрес</th>
                      <th style={{ padding: '8px 10px' }}>Статус / ML Risk</th>
                      <th style={{ padding: '8px 10px' }}>Поведение клиента</th>
                      <th style={{ padding: '8px 10px' }}>Результат</th>
                      <th style={{ padding: '8px 10px' }}>Управление IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const isIpBanned = log.isBanned || bannedIps.includes(log.ip);
                      return (
                        <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {new Date(log.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{log.code}</td>
                          <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#334155' }}>{log.ip}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 100,
                                fontWeight: 700,
                                fontSize: 11,
                                background: isIpBanned || log.riskLevel === 'high' ? '#fee2e2' : log.riskLevel === 'medium' ? '#fef3c7' : '#dcfce7',
                                color: isIpBanned || log.riskLevel === 'high' ? '#b91c1c' : log.riskLevel === 'medium' ? '#b45309' : '#15803d',
                              }}
                            >
                              {isIpBanned ? '🚫 ЗАБАНЕН' : log.riskLevel === 'high' ? '🔴 Повтор' : log.riskLevel === 'medium' ? '🟡 Сегодня' : '🟢 Новый'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#475569' }}>
                            {log.riskReasons.join('; ')}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            {log.success ? (
                              <span style={{ color: '#15803d', fontWeight: 600 }}>✓ Скидка выдана</span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: 500 }} title={log.error}>✕ Отклонено</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            {isIpBanned ? (
                              <button
                                type="button"
                                onClick={() => handleUnbanIp(log.ip)}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  background: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  color: '#15803d',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Разбанить
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleBanIp(log.ip)}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  color: '#b91c1c',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Забанить
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Prices */}
        <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>💰 Прайс-лист (Цены)</h2>
          
          <div style={{ display: 'grid', gap: 20 }}>
            {content.priceGroups.map((group, gIdx) => (
              <div key={group.title} style={{ border: '1px solid #e5e5e7', borderRadius: 12, padding: 16 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>
                  Категория: {group.title}
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newGroups = [...content.priceGroups];
                          newGroups[gIdx].items[iIdx].name = e.target.value;
                          setContent({ ...content, priceGroups: newGroups });
                        }}
                        placeholder="Название услуги"
                        style={{ flex: 2, padding: '8px 10px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 13 }}
                      />
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => {
                          const newGroups = [...content.priceGroups];
                          newGroups[gIdx].items[iIdx].price = e.target.value;
                          setContent({ ...content, priceGroups: newGroups });
                        }}
                        placeholder="Цена (например 2000 ₽)"
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 13 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeletePriceItem(gIdx, iIdx)}
                        style={{ padding: '8px 12px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', border: 'none', fontSize: 12, cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPriceItem(gIdx)}
                  style={{ marginTop: 12, padding: '6px 12px', borderRadius: 8, background: '#f0f0f2', border: 'none', color: '#1d1d1f', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  + Добавить услугу в «{group.title}»
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>
              Примечание к прайсу (внизу блока цен)
            </label>
            <input
              type="text"
              value={content.copy.priceNote}
              onChange={(e) => setContent({ ...content, copy: { ...content.copy, priceNote: e.target.value } })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d2d2d7', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
        </section>

        {/* Section 5: Works Photos */}
        <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>📸 Фото работ в галерее</h2>

          {/* Upload Form */}
          <form onSubmit={handleUploadPhoto} style={{ border: '2px dashed #d2d2d7', borderRadius: 12, padding: 20, marginBottom: 20, background: '#fafafc' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>Загрузить новое фото работы</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'center' }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                required
                style={{ fontSize: 13 }}
              />
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Название (например: Молочный нюд)"
                style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 13 }}
              />
              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                style={{ padding: '8px 14px', borderRadius: 8, background: '#1d1d1f', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer' }}
              >
                {isUploading ? 'Загрузка и сжатие...' : 'Загрузить в галерею'}
              </button>
            </div>
          </form>

          {/* Works Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {content.works.map((work, idx) => (
              <div key={idx} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e5e7', background: '#000' }}>
                <img src={work.src} alt={work.alt} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '6px 8px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {work.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteWork(idx)}
                    title="Удалить фото"
                    style={{ background: 'none', border: 'none', color: '#b91c1c', fontSize: 13, cursor: 'pointer', padding: 2 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Reviews */}
        <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1d1d1f' }}>💬 Отзывы клиентов</h2>
            <button
              type="button"
              onClick={handleAddReview}
              style={{ padding: '6px 12px', borderRadius: 8, background: '#f0f0f2', border: 'none', color: '#1d1d1f', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              + Добавить отзыв
            </button>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {content.reviews.map((review, idx) => (
              <div key={idx} style={{ border: '1px solid #e5e5e7', borderRadius: 12, padding: 16, position: 'relative' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#6e6e73', marginBottom: 4 }}>Имя автора</label>
                    <input
                      type="text"
                      value={review.name}
                      onChange={(e) => {
                        const newReviews = [...content.reviews];
                        newReviews[idx].name = e.target.value;
                        setContent({ ...content, reviews: newReviews });
                      }}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#6e6e73', marginBottom: 4 }}>Услуга</label>
                    <input
                      type="text"
                      value={review.service}
                      onChange={(e) => {
                        const newReviews = [...content.reviews];
                        newReviews[idx].service = e.target.value;
                        setContent({ ...content, reviews: newReviews });
                      }}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#6e6e73', marginBottom: 4 }}>Дата</label>
                    <input
                      type="text"
                      value={review.date}
                      onChange={(e) => {
                        const newReviews = [...content.reviews];
                        newReviews[idx].date = e.target.value;
                        setContent({ ...content, reviews: newReviews });
                      }}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#6e6e73', marginBottom: 4 }}>Оценка (звёзды 1-5)</label>
                    <select
                      value={review.rating || 5}
                      onChange={(e) => {
                        const newReviews = [...content.reviews];
                        newReviews[idx].rating = Number(e.target.value);
                        setContent({ ...content, reviews: newReviews });
                      }}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 12, boxSizing: 'border-box' }}
                    >
                      <option value="5">5 звёзд (★★★★★)</option>
                      <option value="4">4 звезды (★★★★☆)</option>
                      <option value="3">3 звезды (★★★☆☆)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6e6e73', marginBottom: 4 }}>Текст отзыва</label>
                  <textarea
                    rows={2}
                    value={review.text}
                    onChange={(e) => {
                      const newReviews = [...content.reviews];
                      newReviews[idx].text = e.target.value;
                      setContent({ ...content, reviews: newReviews });
                    }}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d2d2d7', fontSize: 12, boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteReview(idx)}
                  style={{ marginTop: 8, padding: '4px 8px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', border: 'none', fontSize: 11, cursor: 'pointer' }}
                >
                  Удалить отзыв
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Save Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.95)', borderTop: '1px solid #e5e5e7', backdropFilter: 'blur(16px)', padding: '14px 20px', zIndex: 100 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {saveStatus === 'saved' && (
              <span style={{ color: '#15803d', fontWeight: 600, fontSize: 13 }}>✓ Изменения успешно сохранены и применены на сайте!</span>
            )}
            {saveStatus === 'error' && (
              <span style={{ color: '#b91c1c', fontWeight: 600, fontSize: 13 }}>Ошибка сохранения: {errorMessage}</span>
            )}
            {saveStatus === 'saving' && (
              <span style={{ color: '#6e6e73', fontSize: 13 }}>Сохранение изменений...</span>
            )}
            {saveStatus === 'idle' && (
              <span style={{ color: '#6e6e73', fontSize: 13 }}>Не забудьте сохранить внесенные правки</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: saveStatus === 'saved' ? '#15803d' : '#1d1d1f',
              color: '#fff',
              border: 'none',
              fontSize: 14,
              fontWeight: 700,
              cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              transition: 'background 0.2s ease',
            }}
          >
            {saveStatus === 'saving' ? 'Сохранение...' : '💾 Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  );
}
