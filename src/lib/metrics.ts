import type { BpoModule, Deal, GroupCompany, PipelineStage } from "@/types/crm";
import { BPO_COMPANY, BPO_MODULES, GROUP_COMPANIES } from "@/lib/organization";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { toAnnualValue } from "@/lib/format";

/**
 * Métricas del informe gerencial. Convenciones:
 * - Todos los montos se anualizan (mensual × 12) para sumar en la misma base.
 * - "Pipeline" = oportunidades abiertas: excluye las cerradas como Ganado o Perdido.
 * - Valor ponderado = valor anual × probabilidad.
 */

export const ALL_COMPANIES = "Consolidado" as const;
export const ALL_OWNERS = "Todos" as const;

export interface DealFilters {
  company: GroupCompany | typeof ALL_COMPANIES;
  owner: string;
}

export interface Totals {
  count: number;
  value: number;
  weighted: number;
}

export const annualValue = (d: Deal) => toAnnualValue(d.estimatedValue, d.valuePeriod);
export const weightedValue = (d: Deal) => (annualValue(d) * d.probability) / 100;
export const isOpen = (d: Deal) => d.closeStatus === undefined;

export function filterDeals(deals: Deal[], { company, owner }: DealFilters): Deal[] {
  return deals.filter(
    (d) => (company === ALL_COMPANIES || d.groupCompany === company) && (owner === ALL_OWNERS || d.owner === owner),
  );
}

export function totals(deals: Deal[]): Totals {
  return deals.reduce(
    (acc, d) => ({ count: acc.count + 1, value: acc.value + annualValue(d), weighted: acc.weighted + weightedValue(d) }),
    { count: 0, value: 0, weighted: 0 },
  );
}

export interface Summary {
  open: Totals;
  averageTicket: number;
  won: Totals;
  lostCount: number;
}

export function summarize(deals: Deal[]): Summary {
  const open = totals(deals.filter(isOpen));
  return {
    open,
    averageTicket: open.count ? open.value / open.count : 0,
    won: totals(deals.filter((d) => d.closeStatus === "Ganado")),
    lostCount: deals.filter((d) => d.closeStatus === "Perdido").length,
  };
}

/** Distribución del pipeline abierto por etapa, en el orden del embudo. */
export function byStage(deals: Deal[]): (Totals & { stage: PipelineStage })[] {
  const open = deals.filter(isOpen);
  return PIPELINE_STAGES.map((stage) => ({ stage, ...totals(open.filter((d) => d.stageId === stage.id)) }));
}

export function byCompany(deals: Deal[]): (Totals & { company: GroupCompany })[] {
  const open = deals.filter(isOpen);
  return GROUP_COMPANIES.map((company) => ({ company, ...totals(open.filter((d) => d.groupCompany === company)) }));
}

/** Pipeline abierto por comercial, de mayor a menor valor. */
export function byOwner(deals: Deal[]): (Totals & { owner: string })[] {
  const open = deals.filter(isOpen);
  const owners = [...new Set(open.map((d) => d.owner))];
  return owners
    .map((owner) => ({ owner, ...totals(open.filter((d) => d.owner === owner)) }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Desglose por módulo BPO (solo Servinacional). Un negocio con varios módulos cuenta como
 * oportunidad en cada uno, pero su valor se reparte en partes iguales para que los montos
 * sumen exactamente el pipeline de Servinacional (sin doble conteo).
 */
export function byBpoModule(deals: Deal[]): (Totals & { module: BpoModule })[] {
  const open = deals.filter((d) => isOpen(d) && d.groupCompany === BPO_COMPANY && d.bpoModules.length > 0);
  return BPO_MODULES.map((module) => {
    const withModule = open.filter((d) => d.bpoModules.includes(module));
    return withModule.reduce<Totals & { module: BpoModule }>(
      (acc, d) => ({
        module,
        count: acc.count + 1,
        value: acc.value + annualValue(d) / d.bpoModules.length,
        weighted: acc.weighted + weightedValue(d) / d.bpoModules.length,
      }),
      { module, count: 0, value: 0, weighted: 0 },
    );
  });
}

export function topDeals(deals: Deal[], limit = 5): Deal[] {
  return deals
    .filter(isOpen)
    .sort((a, b) => annualValue(b) - annualValue(a))
    .slice(0, limit);
}

export function ownersOf(deals: Deal[]): string[] {
  return [...new Set(deals.map((d) => d.owner).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}
