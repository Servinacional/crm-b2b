import { Building2, CalendarDays } from "lucide-react";
import type { CloseStatus, Deal } from "@/types/crm";
import { formatDealValue, formatShortDate } from "@/lib/format";
import { CLOSING_STAGE_ID } from "@/lib/pipeline";
import { CloseStatusSelector } from "./CloseStatusSelector";
import { ProbabilityBadge } from "./ProbabilityBadge";

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
  onOpen?: (deal: Deal) => void;
  onCloseStatusChange?: (dealId: string, status: CloseStatus) => void;
}

const STATUS_BADGE: Record<CloseStatus, string> = {
  Ganado: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Perdido: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function DealCard({ deal, isDragging = false, onOpen, onCloseStatusChange }: DealCardProps) {
  const isClosing = deal.stageId === CLOSING_STAGE_ID;

  return (
    <article
      onClick={onOpen ? () => onOpen(deal) : undefined}
      className={`${onOpen ? "cursor-pointer" : ""} rounded-lg border bg-white p-3 transition-[box-shadow,border-color,transform] duration-150 ${
        isDragging
          ? "rotate-2 border-indigo-400 shadow-xl ring-2 ring-indigo-400/30"
          : "border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-slate-900">{deal.title}</h3>
        {isClosing && deal.closeStatus ? (
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_BADGE[deal.closeStatus]}`}
          >
            {deal.closeStatus}
          </span>
        ) : (
          <ProbabilityBadge value={deal.probability} />
        )}
      </div>

      {deal.companyName && (
        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
          <Building2 className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{deal.companyName}</span>
        </p>
      )}

      <p
        className={`mt-3 text-sm font-semibold tabular-nums ${
          deal.closeStatus === "Perdido" && isClosing ? "text-slate-400 line-through" : "text-slate-800"
        }`}
      >
        {formatDealValue(deal.estimatedValue, deal.valuePeriod)}
      </p>

      <div className="mt-2 flex items-center gap-1.5 border-t border-slate-100 pt-2 text-xs text-slate-500">
        <CalendarDays className="size-3.5" aria-hidden />
        <time dateTime={deal.targetCloseDate}>{formatShortDate(deal.targetCloseDate)}</time>
      </div>

      {isClosing && onCloseStatusChange && (
        // stopPropagation: elegir el resultado no debe abrir el modal de edición.
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <CloseStatusSelector
            value={deal.closeStatus}
            onChange={(status) => onCloseStatusChange(deal.id, status)}
          />
        </div>
      )}
    </article>
  );
}
