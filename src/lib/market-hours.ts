export type CashVenue = 'NYSE' | 'LSE';

type SessionConfig = {
  timeZone: string;
  open: number;
  close: number;
  city: string;
  hoursLabel: string;
};

const SESSIONS: Record<CashVenue, SessionConfig> = {
  /** Regular cash session. NYSE holidays are not modeled. */
  NYSE: {
    timeZone: 'America/New_York',
    open: 9 * 60 + 30,
    close: 16 * 60,
    city: 'New York',
    hoursLabel: '09:30–16:00',
  },
  /** LSE continuous trading. Opening/closing auctions sit outside this window. */
  LSE: {
    timeZone: 'Europe/London',
    open: 8 * 60,
    close: 16 * 60 + 30,
    city: 'London',
    hoursLabel: '08:00–16:30',
  },
};

/**
 * On-exchange days from the LSE business-days table.
 * https://www.londonstockexchange.com/en/resources/markets-products/business-days
 * Half days: "Markets closing process commences from 12:30 London time."
 * The exchange says it keeps these days under review. Dates not on that table are not listed.
 */
export type LseClosure = {
  /** Civil date in Europe/London. */
  date: string;
  /** Wording from the LSE table. */
  name: string;
  /** Minute-of-day the closing process starts. Absent means a full non-trading day. */
  closeMins?: number;
};

export const LSE_CALENDAR_URL =
  'https://www.londonstockexchange.com/en/resources/markets-products/business-days';

export const LSE_REGULAR_HOURS = '08:00–16:30 Europe/London, Monday–Friday';

const EARLY_CLOSE = 12 * 60 + 30;

export const LSE_CLOSURES: readonly LseClosure[] = [
  { date: '2026-08-31', name: 'Summer Bank Holiday' },
  { date: '2026-12-24', name: 'Christmas Holiday half day', closeMins: EARLY_CLOSE },
  { date: '2026-12-25', name: 'Christmas Day' },
  { date: '2026-12-28', name: 'Boxing Day (substitute)' },
  { date: '2026-12-31', name: "New Year's Holiday half day", closeMins: EARLY_CLOSE },
  { date: '2027-01-01', name: "New Year's Day" },
  { date: '2027-03-26', name: 'Good Friday' },
  { date: '2027-03-29', name: 'Easter Monday' },
  { date: '2027-05-03', name: 'Early May Bank Holiday' },
  { date: '2027-05-31', name: 'Spring Bank Holiday' },
  { date: '2027-08-30', name: 'Summer Bank Holiday' },
  { date: '2027-12-24', name: 'Christmas Holiday half day', closeMins: EARLY_CLOSE },
  { date: '2027-12-27', name: 'Christmas Day (substitute)' },
  { date: '2027-12-28', name: 'Boxing Day (substitute)' },
  { date: '2027-12-31', name: "New Year's Holiday half day", closeMins: EARLY_CLOSE },
  { date: '2028-01-03', name: "New Year's Day (substitute)" },
  { date: '2028-04-14', name: 'Good Friday' },
  { date: '2028-04-17', name: 'Easter Monday' },
  { date: '2028-05-01', name: 'Early May Bank Holiday' },
  { date: '2028-05-29', name: 'Spring Bank Holiday' },
  { date: '2028-08-28', name: 'Summer Bank Holiday' },
  { date: '2028-12-22', name: 'Christmas Holiday half day', closeMins: EARLY_CLOSE },
  { date: '2028-12-25', name: 'Christmas Day' },
  { date: '2028-12-26', name: 'Boxing Day' },
  { date: '2028-12-29', name: "New Year's Holiday half day", closeMins: EARLY_CLOSE },
  { date: '2029-01-01', name: "New Year's Day" },
];

const LSE_BY_DATE = new Map(LSE_CLOSURES.map((row) => [row.date, row]));

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export type CashSession = {
  venue: CashVenue;
  isOpen: boolean;
  /** Countdown only, e.g. "3h 12m" or "2d 5h". */
  timeLabel: string;
  /** Text after OPEN/CLOSED, including the leading separator. */
  tail: string;
  /** Full status, e.g. "● LSE OPEN · 08:00–16:30 London · closes in 3h 12m". */
  statusLine: string;
  /** Session window the countdown refers to, "08:00–16:30" or an early close. */
  hoursLabel: string;
  regularHoursLabel: string;
  city: string;
  timeZone: string;
  /** Set when the next open is not later today. */
  opensWeekday: string | null;
  /** Published name when today is on the LSE calendar. */
  closureName: string | null;
  closureKind: 'closed' | 'early' | null;
  openAt: Date;
  closeAt: Date;
};

type Civil = { year: number; month: number; day: number };

type DayPlan = {
  closed: boolean;
  open: number;
  close: number;
  name: string | null;
  kind: 'closed' | 'early' | null;
};

export function venueTooltip(venue: CashVenue): string {
  if (venue === 'LSE') {
    return 'London Stock Exchange regular session, 08:00–16:30 Europe/London, Monday–Friday.';
  }
  return 'New York Stock Exchange regular session, 09:30–16:00 America/New_York, Monday–Friday.';
}

export function sessionTooltip(session: CashSession, localLabel: string | null): string {
  const bits = [venueTooltip(session.venue)];
  if (session.closureKind === 'early' && session.closureName) {
    bits.push(`${session.closureName}: closing process from 12:30 London.`);
  } else if (session.closureKind === 'closed' && session.closureName) {
    bits.push(`${session.closureName}: exchange closed.`);
  }
  if (localLabel) {
    bits.push(`Your time: ${localLabel}.`);
  }
  return bits.join(' ');
}

/** Closures on or after the current London civil date. */
export function upcomingLseClosures(now = new Date()): LseClosure[] {
  const today = isoFromParts(zonedParts(now, 'Europe/London'));
  return LSE_CLOSURES.filter((row) => row.date >= today);
}

export function formatLondonDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** Regular cash-session clock for NYSE or the London Stock Exchange. */
export function cashSession(venue: CashVenue, now = new Date()): CashSession {
  const cfg = SESSIONS[venue];
  const parts = zonedParts(now, cfg.timeZone);
  const today: Civil = { year: parts.year, month: parts.month, day: parts.day };
  const todayPlan = dayPlan(venue, today);
  const isOpen = !todayPlan.closed && parts.mins >= todayPlan.open && parts.mins < todayPlan.close;

  let sessionCivil = today;
  let sessionPlan = todayPlan;
  if (todayPlan.closed || parts.mins >= todayPlan.close) {
    for (let i = 1; i <= 16; i++) {
      const civil = addCalendarDays(today, i);
      const plan = dayPlan(venue, civil);
      if (!plan.closed) {
        sessionCivil = civil;
        sessionPlan = plan;
        break;
      }
    }
  }

  const openAt = zonedCivilToUtc(sessionCivil, sessionPlan.open, cfg.timeZone);
  const closeAt = zonedCivilToUtc(sessionCivil, sessionPlan.close, cfg.timeZone);
  const boundary = isOpen ? closeAt : openAt;
  const countdown = formatCountdown(boundary.getTime() - now.getTime());
  const sameDay =
    sessionCivil.year === today.year &&
    sessionCivil.month === today.month &&
    sessionCivil.day === today.day;
  const opensWeekday =
    !isOpen && !sameDay ? WEEKDAY[weekdayIndex(sessionCivil)] : null;
  const hoursLabel = `${formatHm(sessionPlan.open)}–${formatHm(sessionPlan.close)}`;
  const openClock = formatHm(sessionPlan.open);
  const when = opensWeekday ? `${opensWeekday} ${openClock}` : openClock;
  const closureName = todayPlan.name;
  const closureKind = todayPlan.kind;
  let tail: string;
  if (isOpen) {
    tail = ` · ${hoursLabel} ${cfg.city} · closes in ${countdown}`;
  } else if (sameDay && closureKind === 'early') {
    tail = ` · opens ${hoursLabel} ${cfg.city} (in ${countdown})`;
  } else {
    const why = closureName ? `${closureName} · ` : '';
    tail = ` · ${why}opens ${when} ${cfg.city} (in ${countdown})`;
  }
  const state = isOpen ? 'OPEN' : 'CLOSED';

  return {
    venue,
    isOpen,
    timeLabel: countdown,
    tail,
    statusLine: `● ${venue} ${state}${tail}`,
    hoursLabel,
    regularHoursLabel: cfg.hoursLabel,
    city: cfg.city,
    timeZone: cfg.timeZone,
    opensWeekday,
    closureName,
    closureKind,
    openAt,
    closeAt,
  };
}

/**
 * Session window in a timezone. Returns null when that zone shows the same
 * clock times as the venue, so the secondary label is not repeated.
 * Call from the browser only — the default zone is the viewer's.
 */
export function viewerLocalLabel(session: CashSession, timeZone = viewerTimeZone()): string | null {
  if (!timeZone || timeZone === session.timeZone) return null;
  const local = formatSessionInZone(session.openAt, session.closeAt, timeZone);
  const venue = formatSessionInZone(session.openAt, session.closeAt, session.timeZone);
  if (local === venue) return null;
  return local;
}

export function formatSessionInZone(openAt: Date, closeAt: Date, timeZone: string): string {
  const openDay = weekdayInZone(openAt, timeZone);
  const closeDay = weekdayInZone(closeAt, timeZone);
  const openT = clockInZone(openAt, timeZone);
  const closeT = clockInZone(closeAt, timeZone);
  if (openDay === closeDay) return `${openT}–${closeT}`;
  return `${openDay} ${openT}–${closeDay} ${closeT}`;
}

function viewerTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return '';
  }
}

function dayPlan(venue: CashVenue, civil: Civil): DayPlan {
  const cfg = SESSIONS[venue];
  const weekend = weekdayIndex(civil) === 0 || weekdayIndex(civil) === 6;
  const mark = venue === 'LSE' ? LSE_BY_DATE.get(isoFromParts(civil)) : undefined;
  if (weekend || (mark && mark.closeMins == null)) {
    return {
      closed: true,
      open: cfg.open,
      close: cfg.close,
      name: mark?.name ?? null,
      kind: mark ? 'closed' : null,
    };
  }
  const close = mark?.closeMins ?? cfg.close;
  const early = close !== cfg.close;
  return {
    closed: false,
    open: cfg.open,
    close,
    name: mark?.name ?? null,
    kind: early ? 'early' : null,
  };
}

function zonedParts(now: Date, timeZone: string): Civil & { mins: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const read = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  let hour = Number(read('hour'));
  if (hour === 24) hour = 0;
  return {
    year: Number(read('year')),
    month: Number(read('month')),
    day: Number(read('day')),
    mins: hour * 60 + Number(read('minute')),
  };
}

function addCalendarDays(civil: Civil, days: number): Civil {
  const dt = new Date(Date.UTC(civil.year, civil.month - 1, civil.day + days));
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

function weekdayIndex(civil: Civil): number {
  return new Date(Date.UTC(civil.year, civil.month - 1, civil.day)).getUTCDay();
}

function isoFromParts(civil: Civil): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${civil.year}-${pad(civil.month)}-${pad(civil.day)}`;
}

function formatHm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatCountdown(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins <= 0) return '<1m';
  const days = Math.floor(mins / (60 * 24));
  const hours = Math.floor((mins % (60 * 24)) / 60);
  const minutes = mins % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(' ');
}

function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const num = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  let hour = num('hour');
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(num('year'), num('month') - 1, num('day'), hour, num('minute'), num('second'));
  return asUtc - instant.getTime();
}

function zonedCivilToUtc(civil: Civil, mins: number, timeZone: string): Date {
  const utcGuess = Date.UTC(
    civil.year,
    civil.month - 1,
    civil.day,
    Math.floor(mins / 60),
    mins % 60,
    0,
  );
  const offsetGuess = zoneOffsetMs(new Date(utcGuess), timeZone);
  let result = utcGuess - offsetGuess;
  const offsetResult = zoneOffsetMs(new Date(result), timeZone);
  if (offsetResult !== offsetGuess) result = utcGuess - offsetResult;
  return new Date(result);
}

function clockInZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  let hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  if (hour === '24') hour = '00';
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

function weekdayInZone(date: Date, timeZone: string): string {
  return (
    new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' })
      .formatToParts(date)
      .find((p) => p.type === 'weekday')?.value ?? ''
  );
}
