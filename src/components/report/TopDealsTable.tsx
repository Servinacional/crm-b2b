import type { Deal } from "@/types/crm";
import { annualValue, weightedValue } from "@/lib/metrics";
import { formatCOPCompact } from "@/lib/format";
import { getStage } from "@/lib/pipeline";
import { CompanyTag } from "@/components/ui/CompanyTag";
import { OwnerAvatar } from "@/components/ui/OwnerAvatar";
import { ProbabilityBadge } from "@/components/kanban/ProbabilityBadge";

interface TopDealsTableProps {
  deals: Deal[];
  onOpenDeal: (deal: Deal) => void;
}

export function TopDealsTable({ deals, onOpenDeal }: TopDealsTableProps) {
  if (deals.length === 0) {
    return <p className="py-6 text-center text-xs text-slate-400">Sin oportunidades abiertas.</p>;
  }

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[48rem] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
            <th scope="col" className="w-8 px-5 pb-2 font-medium">#</th>
            <th scope="col" className="pb-2 font-medium">Negocio</th>
            <th scope="col" className="pb-2 font-medium">Empresa del grupo</th>
            <th scope="col" className="pb-2 font-medium">Etapa</th>
            <th scope="col" className="pb-2 text-right font-medium">Prob.</th>
            <th scope="col" className="pb-2 text-right font-medium">Valor anual</th>
            <th scope="col" className="px-5 pb-2 text-right font-medium">Ponderado</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, i) => (
            <tr key={deal.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
              <td className="px-5 py-2.5 tabular-nums text-slate-400">{i + 1}</td>
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-2.5">
                  <OwnerAvatar name={deal.owner} />
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onOpenDeal(deal)}
                      className="block max-w-72 truncate text-left font-medium text-slate-900 hover:text-indigo-700"
                    >
                      {deal.title}
                    </button>
                    <p className="truncate text-xs text-slate-500">
                      {deal.companyName || "Sin empresa cliente"} · {deal.owner}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-2.5 pr-3">
                <CompanyTag company={deal.groupCompany} />
              </td>
              <td className="py-2.5 pr-3 text-xs text-slate-600">{getStage(deal.stageId)?.name}</td>
              <td className="py-2.5 text-right">
                <ProbabilityBadge value={deal.probability} />
              </td>
              <td className="py-2.5 text-right font-medium tabular-nums text-slate-800">
                {formatCOPCompact(annualValue(deal))}
              </td>
              <td className="px-5 py-2.5 text-right tabular-nums text-slate-600">
                {formatCOPCompact(weightedValue(deal))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
