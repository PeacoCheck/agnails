'use client';

import { useState, useEffect } from 'react';
import TrackedLink from './TrackedLink';

interface Props {
  defaultDikidiUrl: string;
}

export default function PromoWidget({ defaultDikidiUrl }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    discount?: string;
    dikidiUrl?: string;
    message?: string;
    code?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (sessionStorage.getItem('ag_promo_popup_closed') === '1') {
        setDismissed(true);
        return;
      }
    } catch {
      // ignore
    }

    const handleScroll = () => {
      if (dismissed || isVisible) return;
      const pricesEl = document.getElementById('prices');
      if (pricesEl) {
        const rect = pricesEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.85) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem('ag_promo_popup_closed', '1');
    } catch {
      // ignore
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/promo/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || 'Не удалось применить промокод' });
      } else {
        setResult({
          ok: true,
          discount: data.discount,
          dikidiUrl: data.dikidiUrl || defaultDikidiUrl,
          message: data.message,
          code: data.code,
        });
      }
    } catch {
      setResult({ ok: false, message: 'Ошибка сети. Пожалуйста, попробуйте позже.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || dismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Специальное предложение"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999,
        maxWidth: 380,
        width: 'calc(100vw - 32px)',
        background: '#ffffff',
        borderRadius: 22,
        padding: '24px 22px 20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        animation: 'slideUpPopup 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fontFamily: 'inherit',
      }}
    >
      {/* Red Octagon Sticker Badge */}
      <div
        title="Приветственный промокод"
        style={{
          position: 'absolute',
          top: -16,
          right: 48,
          width: 58,
          height: 58,
          background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.04em',
          transform: 'rotate(-7deg)',
          boxShadow: '0 6px 16px rgba(225, 29, 72, 0.4)',
          userSelect: 'none',
          cursor: 'pointer',
        }}
        onClick={() => setCode('HELLO')}
      >
        <span style={{ fontSize: 7, textTransform: 'uppercase', opacity: 0.9, lineHeight: 1 }}>КОД</span>
        <span style={{ lineHeight: 1.1 }}>HELLO</span>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Закрыть"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#f3f4f6',
          border: 'none',
          color: '#6b7280',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s ease',
        }}
      >
        ✕
      </button>

      {/* Content Header */}
      <div style={{ paddingRight: 60, marginBottom: 12 }}>
        <h4
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: '#1d1d1f',
            letterSpacing: '-0.02em',
          }}
        >
          🎁 Скидка на первый визит
        </h4>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6e6e73', lineHeight: 1.4 }}>
          Введите промокод, чтобы зафиксировать приветственную скидку:
        </p>
      </div>

      {/* Form or Result */}
      {!result?.ok ? (
        <form onSubmit={handleApply} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ПРОМОКОД"
            maxLength={20}
            required
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #d2d2d7',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              outline: 'none',
              background: '#f9fafb',
              color: '#1d1d1f',
            }}
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              background: '#1d1d1f',
              color: '#ffffff',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !code.trim() ? 0.7 : 1,
            }}
          >
            {loading ? '...' : 'Применить'}
          </button>
        </form>
      ) : (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 14,
            padding: '14px',
            marginTop: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🎉</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>
                Промокод {result.code} активирован!
              </div>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>{result.discount}</div>
            </div>
          </div>
          <TrackedLink
            goal="booking_dikidi"
            href={result.dikidiUrl || defaultDikidiUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px 14px',
              borderRadius: 10,
              background: '#15803d',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              marginTop: 10,
              boxShadow: '0 3px 10px rgba(21, 128, 61, 0.25)',
            }}
          >
            Записаться со скидкой в DIKIDI ↗
          </TrackedLink>
        </div>
      )}

      {/* Error message */}
      {result && !result.ok && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 10,
            background: '#fee2e2',
            color: '#b91c1c',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          ⚠️ {result.message}
        </div>
      )}
    </aside>
  );
}
