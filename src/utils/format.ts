export function formatCurrency(value: number | string, compact = false) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard"
  }).format(Number(value));
}

export function formatUsd(value: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

export function formatNumber(value: number | string) {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0
  }).format(Number(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
