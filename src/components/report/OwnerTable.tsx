import type { Totals } from "@/lib/metrics";
import { formatCOPCompact } from "@/lib/format";
import { OwnerAvatar } from "@/components/ui/OwnerAvatar";

interface OwnerTableProps {
  data: (Totals & { owner: string })[];
  selectedOwner?: string;
  onSelectOwner: (owner: string) => void;
}

export function OwnerTable({ data, selectedOwner, onSelectOwner }: OwnerTableProps) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-xs text-slate-400">Sin oportunidades abiertas.</p>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[30rem] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
            <th scope="col" className="px-5 pb-2 font-medium">Comercial</th>
            <th scope="col" className="pb-2 text-right font-medium">Opor.</th>
            <th scope="col" className="pb-2 text-right font-medium">Pipeline</th>
            <th scope="col" className="pb-2 text-right font-medium">Ponderado</th>
            <th scope="col" className="px-5 pb-2 text-right font-medium">Participación</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr
              key={d.owner}
              className={`border-b border-slate-50 last:border-0 ${d.owner === selectedOwner ? "bg-indigo-50/60" : ""}`}
            >
              <th scope="row" className="px-5 py-2.5 text-left font-normal">
                <button
                  type="button"
                  onClick={() => onSelectOwner(d.owner)}
                  title="Ver solo este comercial"
                  className="inline-flex items-center gap-2 rounded text-slate-800 hover:text-indigo-700"
                >
                  <OwnerAvatar name={d.owner} />
                  {d.owner}
                </button>
              </th>
              <td className="py-2.5 text-right tabular-nums text-slate-600">{d.count}</td>
              <td className="py-2.5 text-right font-medium tabular-nums text-slate-800">{formatCOPCompact(d.value)}</td>
              <td className="py-2.5 text-right tabular-nums text-slate-600">{formatCOPCompact(d.weighted)}</td>
              <td className="px-5 py-2.5 text-right tabular-nums text-slate-500">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
