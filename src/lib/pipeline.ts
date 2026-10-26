import type { PipelineStage, StageId } from "@/types/crm";

export const CLOSING_STAGE_ID: StageId = 6;

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  { id: 1, name: "Primer Contacto / Presentación", accent: "bg-sky-400", defaultProbability: 20 },
  { id: 2, name: "Diagnóstico (As-Is)", accent: "bg-indigo-400", defaultProbability: 40 },
  { id: 3, name: "Diseño de Solución (To-Be)", accent: "bg-violet-400", defaultProbability: 60 },
  { id: 4, name: "Propuesta Presentada", accent: "bg-amber-400", defaultProbability: 75 },
  { id: 5, name: "Negociación", accent: "bg-orange-400", defaultProbability: 85 },
  { id: 6, name: "Cierre (Ganado/Perdido)", accent: "bg-emerald-400", defaultProbability: 100 },
];

export function isStageId(value: number): value is StageId {
  return PIPELINE_STAGES.some((stage) => stage.id === value);
}

export function getStage(id: StageId): PipelineStage | undefined {
  return PIPELINE_STAGES.find((stage) => stage.id === id);
}
