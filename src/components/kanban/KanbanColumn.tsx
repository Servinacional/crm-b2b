import { Draggable, Droppable } from "@hello-pangea/dnd";
import type { CloseStatus, Deal, PipelineStage } from "@/types/crm";
import { formatCOPCompact, toAnnualValue } from "@/lib/format";
import { DealCard } from "./DealCard";

interface KanbanColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  /** false durante SSR / antes de montar: se pinta la columna estática, sin DnD. */
  isDragEnabled: boolean;
  onCloseStatusChange: (dealId: string, status: CloseStatus) => void;
  onOpenDeal: (deal: Deal) => void;
}

export function KanbanColumn({
  stage,
  deals,
  isDragEnabled,
  onCloseStatusChange,
  onOpenDeal,
}: KanbanColumnProps) {
  // Los negocios perdidos no suman al valor de la etapa.
  const annualTotal = deals
    .filter((d) => d.closeStatus !== "Perdido")
    .reduce((sum, d) => sum + toAnnualValue(d.estimatedValue, d.valuePeriod), 0);

  const renderCard = (deal: Deal, isDragging = false) => (
    <DealCard
      deal={deal}
      isDragging={isDragging}
      onOpen={onOpenDeal}
      onCloseStatusChange={onCloseStatusChange}
    />
  );

  const emptyState = (
    <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">
      Sin negocios
    </p>
  );

  return (
    <section aria-label={stage.name} className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-100/70 p-2">
      <header className="px-1.5 pb-2 pt-1">
        <div className="flex items-center gap-2">
          <span className={`size-2 shrink-0 rounded-full ${stage.accent}`} aria-hidden />
          <h2 className="text-xs font-semibold uppercase leading-tight tracking-wide text-slate-600">
            {stage.name}
          </h2>
          <span className="ml-auto rounded-md bg-white px-1.5 text-xs font-medium tabular-nums text-slate-500">
            {deals.length}
          </span>
        </div>
        <p
          className="mt-1 pl-4 text-xs tabular-nums text-slate-500"
          title="Suma anualizada (mensual × 12), sin negocios perdidos"
        >
          <span className="font-semibold text-slate-700">{formatCOPCompact(annualTotal)}</span> COP/año
        </p>
      </header>

      {isDragEnabled ? (
        <Droppable droppableId={String(stage.id)}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex min-h-24 flex-1 flex-col rounded-lg transition-colors ${
                snapshot.isDraggingOver ? "bg-indigo-50/80 ring-1 ring-indigo-200 ring-inset" : ""
              }`}
            >
              {deals.map((deal, index) => (
                <Draggable key={deal.id} draggableId={deal.id} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    // Se usa padding (no gap) para que la librería calcule bien el espacio entre tarjetas.
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      // Espacio inicia el arrastre por teclado; Enter abre la edición.
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" || e.target !== e.currentTarget) return;
                        // Sin preventDefault, este mismo Enter enviaría el formulario recién enfocado en el modal.
                        e.preventDefault();
                        onOpenDeal(deal);
                      }}
                      aria-label={`${deal.title}, ${deal.companyName}. Enter para editar`}
                      className="rounded-lg pb-2 outline-none focus-visible:[&>article]:ring-2 focus-visible:[&>article]:ring-indigo-500"
                    >
                      {renderCard(deal, dragSnapshot.isDragging)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {deals.length === 0 && !snapshot.isDraggingOver && emptyState}
            </div>
          )}
        </Droppable>
      ) : (
        <div className="flex min-h-24 flex-1 flex-col">
          {deals.map((deal) => (
            <div key={deal.id} className="pb-2">
              {renderCard(deal)}
            </div>
          ))}
          {deals.length === 0 && emptyState}
        </div>
      )}
    </section>
  );
}
