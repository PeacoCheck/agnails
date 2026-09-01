'use client';

import type { ComponentPropsWithoutRef } from 'react';

export type MetrikaGoal =
  | 'booking_dikidi'
  | 'contact_phone'
  | 'contact_whatsapp'
  | 'social_vk'
  | 'social_telegram'
  | 'social_max'
  | 'route_yandex_maps';

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

type Props = ComponentPropsWithoutRef<'a'> & { goal: MetrikaGoal };

export default function TrackedLink({ goal, onClick, ...props }: Props) {
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        const id = Number(process.env.NEXT_PUBLIC_YM_ID);
        if (!event.defaultPrevented && Number.isInteger(id) && id > 0) {
          window.ym?.(id, 'reachGoal', goal);
        }
      }}
    />
  );
}
