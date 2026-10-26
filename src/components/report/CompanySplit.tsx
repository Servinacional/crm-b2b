import type { GroupCompany } from "@/types/crm";
import type { Totals } from "@/lib/metrics";
import { COMPANY_COLORS } from "@/lib/organization";
import { formatCOPCompact } from "@/lib/format";

interface CompanySplitProps {
  data: (Totals & { company: GroupCompany })[];
}

const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

/**
 * Parte del todo: barra apilada al 100% con 2px de separación entre segmentos.
 * La leyenda con valores y porcentajes es también la vista de tabla (el color nunca va solo).
 */
export function CompanySplit({ data }: CompanySplitProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const visible = data.filter((d) => d.value > 0);

  if (total === 0) {
    return <p className="py-6 text-center text-xs text-slate-400">Sin pipeline abierto.</p>;
  }

  return (
    <div>
      <div className="flex h-4 gap-[2px] overflow-hidden rounded-[4px]" aria-hidden>
        {visible.map((d) => (
          <div
            key={d.company}
            title={`${d.company}: ${formatCOPCompact(d.value)} COP/año (${percent(d.value, total)}%)`}
            className="h-full transition-[filter] hover:brightness-110"
            style={{ width: `${(d.value / total) * 100}%`, backgroundColor: COMPANY_COLORS[d.company] }}
          />
        ))}
      </div>

      <table className="mt-4 w-full text-xs">
        <caption className="sr-only">Pipeline abierto por empresa del grupo</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Empresa</th>
            <th scope="col">Pipeline</th>
            <th scope="col">Participación</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.company} className="border-t border-slate-100 first:border-t-0">
              <th scope="row" className="py-2 text-left font-normal text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: COMPANY_COLORS[d.company] }} aria-hidden />
                  {d.company}
                  <span className="text-slate-400">· {d.count} opp.</span>
                </span>
              </th>
              <td className="py-2 text-right font-medium tabular-nums text-slate-800">{formatCOPCompact(d.value)}</td>
              <td className="w-12 py-2 text-right tabular-nums text-slate-500">{percent(d.value, total)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
