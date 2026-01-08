export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayKey(now: Date = new Date()): string {
  return formatDateKey(now);
}

export function getYesterdayKey(now: Date = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return formatDateKey(d);
}

export function getMsUntilTomorrow(now: Date = new Date()): number {
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  return Math.max(0, tomorrow.getTime() - now.getTime());
}

export function formatDurationShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}г ${String(minutes).padStart(2, '0')}хв`;
}

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  // Firestore Timestamp support
  const maybeTimestamp = value as { toDate?: () => Date };
  if (typeof maybeTimestamp?.toDate === 'function') {
    try {
      return maybeTimestamp.toDate();
    } catch {
      return null;
    }
  }
  return null;
}

export function isSameDateKey(date: Date, dateKey: string): boolean {
  return formatDateKey(date) === dateKey;
}
