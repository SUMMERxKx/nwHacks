/**
 * Utils: cn (Tailwind merge), toYYYYMMDD, getWeekStart (Monday), getWeekEnd (Sunday).
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Monday of the week containing d. */
export function getWeekStart(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  return x;
}

/** Sunday of the week (6 days after getWeekStart). */
export function getWeekEnd(d: Date): Date {
  const start = getWeekStart(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}
