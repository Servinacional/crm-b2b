"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Deal } from "@/types/crm";
import { useDeals } from "@/hooks/useDeals";
import { SALES_REPS } from "@/lib/organization";
import { ownersOf } from "@/lib/metrics";
import { KanbanBoard } from "@/components/kanban";
import { DealFormModal } from "@/components/deals/DealFormModal";
import { ManagementReport } from "@/components/report/ManagementReport";
import { ViewTabs, tabId, tabPanelId, type PipelineTab } from "./ViewTabs";

interface PipelineViewProps {
  initialDeals: Deal[];
}

/** Qué muestra el modal: nada, un negocio nuevo o la edición de uno existente. */
type EditorState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; deal: Deal };

export function PipelineView({ initialDeals }: PipelineViewProps) {
  const { deals, moveDeal, changeCloseStatus, saveDeal, addActivity, deleteDeal } = useDeals(initialDeals);
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [tab, setTab] = useState<PipelineTab>("kanban");
  const openDeal = (deal: Deal) => setEditor({ mode: "edit", deal });
  const ownerSuggestions = [...new Set([...SALES_REPS, ...ownersOf(deals)])];

  return (
    <>
      {/* max-w = ancho del tablero (6 columnas de 18rem + 5 separaciones de 0.75rem) para alinear el header. */}
      <header className="mx-auto mb-5 flex max-w-[111.75rem] items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pipeline de Ventas</h1>
          <p className="text-sm text-slate-500">
            {deals.length} {deals.length === 1 ? "negocio" : "negocios"} en el pipeline
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ mode: "create" })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="size-4" aria-hidden />
          Nuevo Negocio
        </button>
      </header>

      <div className="mx-auto mb-5 max-w-[111.75rem]">
        <ViewTabs active={tab} onChange={setTab} />
      </div>

      <div role="tabpanel" id={tabPanelId(tab)} aria-labelledby={tabId(tab)}>
        {tab === "kanban" ? (
          <KanbanBoard
            deals={deals}
            onMoveDeal={moveDeal}
            onCloseStatusChange={changeCloseStatus}
            onOpenDeal={openDeal}
          />
        ) : (
          <ManagementReport deals={deals} onOpenDeal={openDeal} />
        )}
      </div>

      {editor.mode !== "closed" && (
        <DealFormModal
          key={editor.mode === "edit" ? editor.deal.id : "new"}
          deal={editor.mode === "edit" ? editor.deal : undefined}
          onSave={saveDeal}
          onDelete={deleteDeal}
          onAddActivity={addActivity}
          ownerSuggestions={ownerSuggestions}
          onClose={() => setEditor({ mode: "closed" })}
        />
      )}
    </>
  );
}
