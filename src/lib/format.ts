import { APP_CONFIG } from "@/config/app.config";

/**
 * Formatting helpers bound to the application locale and currency config.
 * Change `NEXT_PUBLIC_DEFAULT_LOCALE` / `NEXT_PUBLIC_CURRENCY` to globalize
 * every formatted value in the dashboard.
 */

export function formatMoney(amount: number, currency: string = APP_CONFIG.currency, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(APP_CONFIG.locale).format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(fractionDigits)}%`;
}

export function formatDate(value: string | number | Date) {
  return new Intl.DateTimeFormat(APP_CONFIG.locale, { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: string | number | Date) {
  return new Intl.DateTimeFormat(APP_CONFIG.locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatRelativeDate(value: string | number | Date) {
  const date = new Date(value);
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(APP_CONFIG.locale, { numeric: "auto" });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffInSeconds) >= secondsInUnit) {
      return formatter.format(Math.round(diffInSeconds / secondsInUnit), unit);
    }
  }

  return formatter.format(diffInSeconds, "second");
}
