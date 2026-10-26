import type { ValuePeriod } from "@/types/crm";

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

const PERIOD_SUFFIX: Record<ValuePeriod, string> = {
  Mensual: "/mes",
  Anual: "/año",
};

/** Ej: formatCOP(12000000) → "$12.000.000 COP" */
export function formatCOP(value: number): string {
  // es-CO inserta un espacio no separable tras "$"; lo eliminamos para un formato compacto.
  return `${copFormatter.format(value).replace(/\s/g, "")} COP`;
}

/** Ej: formatDealValue(12000000, "Mensual") → "$12.000.000 COP/mes" */
export function formatDealValue(value: number, period: ValuePeriod): string {
  return `${formatCOP(value)}${PERIOD_SUFFIX[period]}`;
}

/** Valor anualizado, para poder sumar negocios mensuales y anuales en la misma base. */
export function toAnnualValue(value: number, period: ValuePeriod): number {
  return period === "Mensual" ? value * 12 : value;
}

/** Ej: formatCOPCompact(180500000) → "$180,5 M"; por debajo del millón usa el formato completo. */
export function formatCOPCompact(value: number): string {
  if (value < 1_000_000) return copFormatter.format(value).replace(/\s/g, "");
  const millions = (value / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 });
  return `$${millions} M`;
}

/** Convierte "YYYY-MM-DD" a "15 dic 2026" sin desfases de zona horaria. */
export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day)
    .toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
    .replace(".", "");
}
