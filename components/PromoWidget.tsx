'use client';

import { useState, useEffect } from 'react';
import TrackedLink from './TrackedLink';

interface Props {
  defaultDikidiUrl: string;
}

export default function PromoWidget({ defaultDikidiUrl }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [coverConflict, setCoverConflict] = useState(false);
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

    const occupiesLowerViewport = (el: Element | null) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight - 72 && rect.bottom > window.innerHeight * 0.42;
    };

    const handleScroll = () => {
      const pricesEl = document.getElementById('prices');
      if (pricesEl && pricesEl.getBoundingClientRect().top <= window.innerHeight * 0.85) {
        setUnlocked(true);
      }

      const bookingEl = document.querySelector('.booking');
      const footerEl = document.querySelector('.site-footer');
      setCoverConflict(occupiesLowerViewport(bookingEl) || occupiesLowerViewport(footerEl));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = () => {
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

  if (!unlocked || dismissed || coverConflict) {
    return null;
  }

  try {
    const release = process.env.NEXT_PUBLIC_RELEASE_ID || 'dev';
    if (sessionStorage.getItem(`ag_book_nudge_shown_${release}`) === '1') {
      return null;
    }
  } catch {
    // ignore
  }

  return (
    <aside className="promo-sheet" aria-label="Специальное предложение">
      <button type="button" className="promo-sheet-close" onClick={handleClose} aria-label="Закрыть">
        ✕
      </button>
      <p className="promo-sheet-kicker">Первый визит</p>
      <h4>Скидка по промокоду</h4>
      <p>Введите код, чтобы зафиксировать приветственную скидку перед записью.</p>

      {!result?.ok ? (
        <form className="promo-sheet-form" onSubmit={handleApply}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ПРОМОКОД"
            maxLength={20}
            required
          />
          <button type="submit" disabled={loading || !code.trim()}>
            {loading ? '…' : 'Применить'}
          </button>
        </form>
      ) : (
        <div className="promo-sheet-success">
          <b>Промокод {result.code} активирован</b>
          <span>{result.discount}</span>
          <TrackedLink
            goal="booking_dikidi"
            href={result.dikidiUrl || defaultDikidiUrl}
            target="_blank"
            rel="noreferrer"
          >
            Записаться со скидкой в DIKIDI ↗
          </TrackedLink>
        </div>
      )}

      {result && !result.ok && (
        <div className="promo-sheet-error">{result.message}</div>
      )}
    </aside>
  );
}
