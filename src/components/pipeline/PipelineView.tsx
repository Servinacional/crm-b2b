"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Deal } from "@/types/crm";
import { useDeals } from "@/hooks/useDeals";
import { KanbanBoard } from "@/components/kanban";
import { DealFormModal } from "@/components/deals/DealFormModal";

interface PipelineViewProps {
  initialDeals: Deal[];
}

/** Qué muestra el modal: nada, un negocio nuevo o la edición de uno existente. */
type EditorState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; deal: Deal };

export function PipelineView({ initialDeals }: PipelineViewProps) {
  const { deals, moveDeal, changeCloseStatus, saveDeal, addActivity, deleteDeal } = useDeals(initialDeals);
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });

  return (
    <>
      {/* max-w = ancho del tablero (6 columnas de 18rem + 5 separaciones de 0.75rem) para alinear el header. */}
      <header className="mx-auto mb-6 flex max-w-[111.75rem] items-end justify-between gap-4">
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

      <KanbanBoard
        deals={deals}
        onMoveDeal={moveDeal}
        onCloseStatusChange={changeCloseStatus}
        onOpenDeal={(deal) => setEditor({ mode: "edit", deal })}
      />

      {editor.mode !== "closed" && (
        <DealFormModal
          key={editor.mode === "edit" ? editor.deal.id : "new"}
          deal={editor.mode === "edit" ? editor.deal : undefined}
          onSave={saveDeal}
          onDelete={deleteDeal}
          onAddActivity={addActivity}
          onClose={() => setEditor({ mode: "closed" })}
        />
      )}
    </>
  );
}
