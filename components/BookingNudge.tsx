'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Variant = 'a' | 'b';

type Props = {
  dikidiUrl: string;
  city: string;
  ratingValue: string;
  ratingCount: number;
};

const RELEASE = process.env.NEXT_PUBLIC_RELEASE_ID || 'dev';
const SESSION_SHOWN = `ag_book_nudge_shown_${RELEASE}`;
const SESSION_CTA = `ag_book_cta_clicked_${RELEASE}`;
const SESSION_VARIANT = `ag_book_nudge_variant_${RELEASE}`;
const LOCAL_CLOSED_AT = `ag_book_nudge_closed_at_${RELEASE}`;
const DAY_MS = 24 * 60 * 60 * 1000;
const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID);

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // ignore
  }
}

function reachGoal(goal: string, params?: Record<string, string>) {
  if (!Number.isInteger(YM_ID) || YM_ID <= 0) return;
  try {
    if (params) window.ym?.(YM_ID, 'reachGoal', goal, params);
    else window.ym?.(YM_ID, 'reachGoal', goal);
  } catch {
    // ignore
  }
}

function isBookingCta(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const link = target.closest('a');
  if (!link) return false;
  const href = (link.getAttribute('href') || '').toLowerCase();
  if (href.includes('dikidi.net') || href.includes('dikidi.ru')) return true;
  if (link.classList.contains('mobile-book') || link.classList.contains('nav-book')) return true;
  return false;
}

function pickVariant(): Variant {
  const existing = safeGet(sessionStorage, SESSION_VARIANT);
  if (existing === 'a' || existing === 'b') return existing;
  const next: Variant = Math.random() < 0.5 ? 'a' : 'b';
  safeSet(sessionStorage, SESSION_VARIANT, next);
  return next;
}

export default function BookingNudge({ dikidiUrl, city, ratingValue, ratingCount }: Props) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [variant, setVariant] = useState<Variant>('b');
  const [dragY, setDragY] = useState(0);

  const variantRef = useRef<Variant>('b');
  const armedRef = useRef(false);
  const shownRef = useRef(false);
  const reviewsHitRef = useRef(false);
  const reviewsTimerRef = useRef<number | null>(null);
  const dwellTimerRef = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (reviewsTimerRef.current) {
      window.clearTimeout(reviewsTimerRef.current);
      reviewsTimerRef.current = null;
    }
    if (dwellTimerRef.current) {
      window.clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  const markCta = useCallback(() => {
    safeSet(sessionStorage, SESSION_CTA, '1');
    clearTimers();
    armedRef.current = false;
  }, [clearTimers]);

  const dismiss = useCallback(
    (reason: 'close' | 'swipe' | 'cta') => {
      const v = variantRef.current;
      setClosing(true);
      window.setTimeout(() => {
        setVisible(false);
        setClosing(false);
        setDragY(0);
      }, 280);
      safeSet(localStorage, LOCAL_CLOSED_AT, String(Date.now()));
      if (reason === 'cta') {
        markCta();
        reachGoal('booking_nudge_cta', { variant: v });
        reachGoal(v === 'a' ? 'booking_nudge_cta_a' : 'booking_nudge_cta_b');
      } else {
        reachGoal('booking_nudge_close', { variant: v, reason });
      }
      clearTimers();
      armedRef.current = false;
    },
    [clearTimers, markCta]
  );

  const tryShow = useCallback(
    (trigger: 'reviews' | 'dwell' | 'exit') => {
      if (shownRef.current || !armedRef.current) return;
      if (safeGet(sessionStorage, SESSION_CTA) === '1') return;
      if (safeGet(sessionStorage, SESSION_SHOWN) === '1') return;

      const closedAt = Number(safeGet(localStorage, LOCAL_CLOSED_AT) || 0);
      if (closedAt && Date.now() - closedAt < DAY_MS) return;
      if (document.querySelector('.promo-sheet')) return;

      const v = variantRef.current;
      shownRef.current = true;
      armedRef.current = false;
      safeSet(sessionStorage, SESSION_SHOWN, '1');
      setVisible(true);
      clearTimers();
      reachGoal('booking_nudge_show', { variant: v, trigger });
      reachGoal(v === 'a' ? 'booking_nudge_show_a' : 'booking_nudge_show_b');
    },
    [clearTimers]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (safeGet(sessionStorage, SESSION_CTA) === '1') return;
    if (safeGet(sessionStorage, SESSION_SHOWN) === '1') return;
    const closedAt = Number(safeGet(localStorage, LOCAL_CLOSED_AT) || 0);
    if (closedAt && Date.now() - closedAt < DAY_MS) return;

    const assigned = pickVariant();
    variantRef.current = assigned;
    setVariant(assigned);
    armedRef.current = true;

    const onClickCapture = (event: MouseEvent) => {
      if (!isBookingCta(event.target)) return;
      markCta();
      if (shownRef.current) setVisible(false);
    };
    document.addEventListener('click', onClickCapture, true);

    const reviewsEl = document.getElementById('reviews');
    let observer: IntersectionObserver | null = null;
    if (reviewsEl && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const hit = entries.some((e) => e.isIntersecting);
          if (!hit || reviewsHitRef.current || !armedRef.current) return;
          reviewsHitRef.current = true;
          reviewsTimerRef.current = window.setTimeout(() => tryShow('reviews'), 10_000);
        },
        { threshold: 0.2 }
      );
      observer.observe(reviewsEl);
    }

    dwellTimerRef.current = window.setTimeout(() => tryShow('dwell'), 10_000);

    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onMouseOut = (event: MouseEvent) => {
      if (!isDesktop || !armedRef.current) return;
      if (event.clientY > 12) return;
      if (event.relatedTarget) return;
      tryShow('exit');
    };
    if (isDesktop) document.addEventListener('mouseout', onMouseOut);

    return () => {
      document.removeEventListener('click', onClickCapture, true);
      if (isDesktop) document.removeEventListener('mouseout', onMouseOut);
      observer?.disconnect();
      clearTimers();
    };
  }, [clearTimers, markCta, tryShow]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const dy = (event.touches[0]?.clientY ?? touchStartY.current) - touchStartY.current;
    if (dy > 0) setDragY(Math.min(dy, 140));
  };

  const onTouchEnd = () => {
    if (dragY > 72) dismiss('swipe');
    else setDragY(0);
    touchStartY.current = null;
  };

  if (!visible && !closing) return null;

  const copy =
    variant === 'a'
      ? {
          title: 'Ещё не записались?',
          text: `${ratingValue}★ и ${ratingCount >= 200 ? '200+' : ratingCount} оценок — посмотрите, почему к нам возвращаются`,
          cta: 'Записаться онлайн',
        }
      : {
          title: `${city} · ${ratingValue}★ — свободные окна на этой неделе`,
          text: 'Скидка 10% по промокоду HELLO на первое посещение',
          cta: 'Выбрать время',
        };

  return (
    <aside
      className={`booking-nudge${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-label="Запись онлайн"
      style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="booking-nudge-handle" aria-hidden="true" />
      <button
        type="button"
        className="booking-nudge-close"
        onClick={() => dismiss('close')}
        aria-label="Закрыть"
      >
        ✕
      </button>
      <p className="booking-nudge-kicker">AG Nails · запись</p>
      <h4>{copy.title}</h4>
      <p>{copy.text}</p>
      <a
        className="booking-nudge-cta"
        href={dikidiUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => dismiss('cta')}
      >
        {copy.cta} <span>↗</span>
      </a>
    </aside>
  );
}
