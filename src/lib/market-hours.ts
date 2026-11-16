export type CashVenue = 'NYSE' | 'LSE';

const SESSIONS: Record<CashVenue, { timeZone: string; open: number; close: number }> = {
  /** Regular cash session. Holidays are not modeled (same as the previous NYSE clock). */
  NYSE: { timeZone: 'America/New_York', open: 9 * 60 + 30, close: 16 * 60 },
  LSE: { timeZone: 'Europe/London', open: 8 * 60, close: 16 * 60 + 30 },
};

export type CashSession = {
  venue: CashVenue;
  isOpen: boolean;
  /** Short countdown, e.g. "CLZ 2H10M" or "OPN 1D3H". */
  timeLabel: string;
};

function zonedClock(now: Date, timeZone: string): { day: number; mins: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  let hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  if (hour === 24) hour = 0;
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: dayMap[weekday] ?? 0, mins: hour * 60 + minute };
}

/** Regular cash-session clock for NYSE or the London Stock Exchange. */
export function cashSession(venue: CashVenue, now = new Date()): CashSession {
  const cfg = SESSIONS[venue];
  const { day, mins } = zonedClock(now, cfg.timeZone);
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && mins >= cfg.open && mins < cfg.close;

  let timeLabel = '';
  if (isOpen) {
    const minsLeft = cfg.close - mins;
    timeLabel = `CLZ ${Math.floor(minsLeft / 60)}H${minsLeft % 60}M`;
  } else {
    let minsUntil: number;
    if (isWeekday && mins < cfg.open) {
      minsUntil = cfg.open - mins;
    } else {
      const daysUntilMon = day === 0 ? 1 : day === 6 ? 2 : day === 5 && mins >= cfg.close ? 3 : 1;
      const minsToMidnight = 24 * 60 - mins;
      minsUntil = minsToMidnight + (daysUntilMon - 1) * 24 * 60 + cfg.open;
    }
    const daysLeft = Math.floor(minsUntil / (60 * 24));
    const hLeft = Math.floor((minsUntil % (60 * 24)) / 60);
    const mLeft = minsUntil % 60;
    timeLabel = daysLeft > 0 ? `OPN ${daysLeft}D${hLeft}H` : `OPN ${hLeft}H${mLeft}M`;
  }

  return { venue, isOpen, timeLabel };
}
