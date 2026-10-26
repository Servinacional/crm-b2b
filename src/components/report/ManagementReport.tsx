"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import type { Deal } from "@/types/crm";
import {
  ALL_COMPANIES,
  ALL_OWNERS,
  byBpoModule,
  byCompany,
  byOwner,
  byStage,
  filterDeals,
  ownersOf,
  summarize,
  topDeals,
  type DealFilters,
} from "@/lib/metrics";
import { BPO_COMPANY, COMPANY_COLORS } from "@/lib/organization";
import { formatCOPCompact } from "@/lib/format";
import { BarList } from "./BarList";
import { CompanySplit } from "./CompanySplit";
import { KpiTile } from "./KpiTile";
import { OwnerTable } from "./OwnerTable";
import { ReportCard } from "./ReportCard";
import { ReportFilters } from "./ReportFilters";
import { TopDealsTable } from "./TopDealsTable";

interface ManagementReportProps {
  deals: Deal[];
  onOpenDeal: (deal: Deal) => void;
}

const opp = (n: number) => `${n} ${n === 1 ? "oportunidad" : "oportunidades"}`;
const cop = (n: number) => `${formatCOPCompact(n)} COP/año`;

export function ManagementReport({ deals, onOpenDeal }: ManagementReportProps) {
  const [filters, setFilters] = useState<DealFilters>({ company: ALL_COMPANIES, owner: ALL_OWNERS });

  const scoped = filterDeals(deals, filters);
  const summary = summarize(scoped);
  const isConsolidated = filters.company === ALL_COMPANIES;
  const showBpo = isConsolidated || filters.company === BPO_COMPANY;
  const bpo = byBpoModule(scoped);

  return (
    <div className="mx-auto max-w-[111.75rem] space-y-5">
      <ReportFilters filters={filters} owners={ownersOf(deals)} onChange={setFilters} />

      {scoped.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500">
          <SearchX className="size-6 text-slate-400" aria-hidden />
          No hay oportunidades para esta combinación de filtros.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile
              label="Pipeline total"
              value={formatCOPCompact(summary.open.value)}
              unit="COP/año"
              detail={summary.won.count > 0 ? `+ ${formatCOPCompact(summary.won.value)} ya ganados` : "Oportunidades abiertas"}
            />
            <KpiTile
              label="Valor ponderado"
              value={formatCOPCompact(summary.open.weighted)}
              unit="COP/año"
              detail={
                summary.open.value > 0
                  ? `${Math.round((summary.open.weighted / summary.open.value) * 100)}% del pipeline (valor × probabilidad)`
                  : "Valor × probabilidad"
              }
            />
            <KpiTile
              label="Oportunidades abiertas"
              value={String(summary.open.count)}
              detail={`${summary.won.count} ganadas · ${summary.lostCount} perdidas`}
            />
            <KpiTile
              label="Ticket promedio"
              value={formatCOPCompact(summary.averageTicket)}
              unit="COP/año"
              detail="Pipeline ÷ oportunidades abiertas"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ReportCard
              title="Distribución por etapa del embudo"
              subtitle="Valor anual del pipeline abierto y cantidad de oportunidades por etapa"
              className={isConsolidated ? "lg:col-span-2" : "lg:col-span-3"}
            >
              <BarList
                ariaLabel="Pipeline por etapa"
                items={byStage(scoped).map((s) => ({
                  key: String(s.stage.id),
                  label: `${s.stage.id}. ${s.stage.name}`,
                  value: s.value,
                  valueLabel: s.count ? `${formatCOPCompact(s.value)} · ${s.count}` : "—",
                  tooltip: {
                    title: s.count ? cop(s.value) : "Sin oportunidades",
                    lines: [s.stage.name, opp(s.count), `Ponderado: ${cop(s.weighted)}`],
                  },
                }))}
              />
            </ReportCard>

            {isConsolidated && (
              <ReportCard title="Pipeline por empresa del grupo" subtitle="Participación en el valor anual abierto">
                <CompanySplit data={byCompany(scoped)} />
              </ReportCard>
            )}

            <ReportCard
              title="Desempeño por comercial"
              subtitle="Pipeline abierto por responsable. Haz clic en un nombre para filtrar."
              className={showBpo ? "lg:col-span-2" : "lg:col-span-3"}
            >
              <OwnerTable
                data={byOwner(scoped)}
                selectedOwner={filters.owner === ALL_OWNERS ? undefined : filters.owner}
                onSelectOwner={(owner) => setFilters((f) => ({ ...f, owner }))}
              />
            </ReportCard>

            {showBpo && (
              <ReportCard title="Servinacional · Módulos BPO" subtitle="Oportunidades abiertas y monto atribuido por módulo">
                <BarList
                  ariaLabel="Pipeline por módulo BPO"
                  color={COMPANY_COLORS[BPO_COMPANY]}
                  items={bpo.map((m) => ({
                    key: m.module,
                    label: m.module,
                    value: m.value,
                    valueLabel: m.count ? `${formatCOPCompact(m.value)} · ${m.count}` : "—",
                    tooltip: {
                      title: m.count ? cop(m.value) : "Sin oportunidades",
                      lines: [m.module, opp(m.count), `Ponderado: ${cop(m.weighted)}`],
                    },
                  }))}
                />
                <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
                  Un negocio con varios módulos cuenta como oportunidad en cada uno, pero su valor se reparte en
                  partes iguales: los montos suman el pipeline de Servinacional (
                  {formatCOPCompact(bpo.reduce((sum, m) => sum + m.value, 0))}) sin doble conteo.
                </p>
              </ReportCard>
            )}

            <ReportCard
              title="Top 5 negocios de mayor valor"
              subtitle="Oportunidades abiertas ordenadas por valor anual. Haz clic en un negocio para editarlo."
              className="lg:col-span-3"
            >
              <TopDealsTable deals={topDeals(scoped)} onOpenDeal={onOpenDeal} />
            </ReportCard>
          </div>

          <p className="text-[11px] text-slate-400">
            Montos anualizados (valores mensuales × 12). El pipeline excluye negocios cerrados como Ganado o Perdido.
          </p>
        </>
      )}
    </div>
  );
}
