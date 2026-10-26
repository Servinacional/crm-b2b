"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useMounted } from "@/hooks/useMounted";
import type { CloseStatus, Deal, StageId } from "@/types/crm";
import { PIPELINE_STAGES, isStageId } from "@/lib/pipeline";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  deals: Deal[];
  onMoveDeal: (dealId: string, stageId: StageId, index: number) => void;
  onCloseStatusChange: (dealId: string, status: CloseStatus) => void;
  onOpenDeal: (deal: Deal) => void;
}

function groupByStage(deals: Deal[]): Map<StageId, Deal[]> {
  const groups = new Map<StageId, Deal[]>(PIPELINE_STAGES.map((s) => [s.id, []]));
  for (const deal of deals) groups.get(deal.stageId)?.push(deal);
  return groups;
}

export function KanbanBoard({ deals, onMoveDeal, onCloseStatusChange, onOpenDeal }: KanbanBoardProps) {
  // DragDropContext solo se monta en el cliente para evitar desajustes de hidratación.
  const mounted = useMounted();

  const handleDragEnd = ({ source, destination, draggableId }: DropResult) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const destStageId = Number(destination.droppableId);
    if (!isStageId(destStageId)) return;

    onMoveDeal(draggableId, destStageId, destination.index);
  };

  const dealsByStage = groupByStage(deals);

  const columns = (
    <div className="overflow-x-auto pb-4">
      <div className="mx-auto flex min-h-[calc(100vh-14rem)] w-max gap-3">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage.get(stage.id) ?? []}
            isDragEnabled={mounted}
            onCloseStatusChange={onCloseStatusChange}
            onOpenDeal={onOpenDeal}
          />
        ))}
      </div>
    </div>
  );

  return mounted ? <DragDropContext onDragEnd={handleDragEnd}>{columns}</DragDropContext> : columns;
}
