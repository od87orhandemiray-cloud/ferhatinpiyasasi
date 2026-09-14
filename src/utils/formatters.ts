// Formatting helpers for Turkish BIST numbers and currency

export function formatPrice(val: number | string | undefined | null, decimals = 2): string {
  if (val === undefined || val === null || val === "") return "0.00";
  const num = typeof val === "string" ? parseFloat(val.replace(",", ".")) : val;
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatLots(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "0";
  const num = typeof val === "string" ? parseInt(val.replace(/\./g, "").replace(/,/g, ""), 10) : val;
  if (isNaN(num)) return "0";
  return num.toLocaleString("tr-TR");
}

export function formatCompactNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "0";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0";

  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(".", ",") + " Mrd";
  }
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(".", ",") + " Mn";
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1).replace(".", ",") + " B";
  }
  return num.toLocaleString("tr-TR");
}

export function formatPercentage(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "%0.00";
  const num = typeof val === "string" ? parseFloat(val.replace(",", ".")) : val;
  if (isNaN(num)) return "%0.00";
  const sign = num > 0 ? "+" : "";
  return `${sign}%${num.toFixed(2).replace(".", ",")}`;
}
