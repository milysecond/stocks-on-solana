'use client';

import { useEffect, useState } from 'react';
import {
  cashSession,
  sessionTooltip,
  venueTooltip,
  viewerLocalLabel,
  type CashVenue,
} from '@/lib/market-hours';

/** Clock-independent label so server HTML and the first client render match. */
const PLACEHOLDER: Record<CashVenue, string> = {
  LSE: ' · 08:00–16:30 London',
  NYSE: ' · 09:30–16:00 New York',
};

function useMarketSession(venue: CashVenue) {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [local, setLocal] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setNowMs(now.getTime());
      setLocal(viewerLocalLabel(cashSession(venue, now)));
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [venue]);

  const session = nowMs == null ? null : cashSession(venue, new Date(nowMs));
  return { session, local: nowMs == null ? null : local };
}

/** Status-bar chip: venue hours, open/closed, and a countdown. Local time is client-only. */
export function MarketStatusItem({ venue }: { venue: CashVenue }) {
  const { session, local } = useMarketSession(venue);
  const title = session ? sessionTooltip(session, local) : venueTooltip(venue);

  return (
    <span className="sb-item sb-market" title={title}>
      <span className={session ? (session.isOpen ? 'sb-status-open' : 'sb-status-closed') : 'sb-market-detail'}>
        ● {venue}{session ? ` ${session.isOpen ? 'OPEN' : 'CLOSED'}` : ''}
      </span>
      <span className="sb-market-detail">{session ? session.tail : PLACEHOLDER[venue]}</span>
      {local ? <span className="sb-market-local"> · {local} your time</span> : null}
    </span>
  );
}

/** Market-hours line for a listing page. The countdown starts after mount so it cannot freeze at build time. */
export function ListingHoursLine({ venue }: { venue: CashVenue }) {
  const { session, local } = useMarketSession(venue);
  const title = session ? sessionTooltip(session, local) : venueTooltip(venue);

  return (
    <p
      title={title}
      style={{
        margin: 0,
        fontSize: 13,
        lineHeight: 1.45,
        color: '#d2d2d2',
      }}
    >
      <span style={{ color: session ? (session.isOpen ? '#00c864' : '#ff5c5c') : '#d2d2d2', fontWeight: 700 }}>
        ● {venue}{session ? ` ${session.isOpen ? 'OPEN' : 'CLOSED'}` : ''}
      </span>
      <span>{session ? session.tail : PLACEHOLDER[venue]}</span>
      {local ? <span style={{ color: '#8d8d8d' }}> · {local} your time</span> : null}
    </p>
  );
}
