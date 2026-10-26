import type { CloseStatus, Deal, StageId } from "@/types/crm";
import { CLOSING_STAGE_ID, getStage } from "@/lib/pipeline";

/** Probabilidad fija según el resultado del cierre. */
export const CLOSE_STATUS_PROBABILITY: Record<CloseStatus, number> = {
  Ganado: 100,
  Perdido: 0,
};

/**
 * Aplica las reglas de negocio al cambiar de etapa:
 * - Al salir de Cierre se borra el resultado y la probabilidad vuelve al valor sugerido de la etapa destino.
 * - Entre etapas 1–5, o al entrar a Cierre sin resultado, la probabilidad se conserva.
 */
export function moveDealToStage(deal: Deal, stageId: StageId): Deal {
  if (deal.stageId === stageId) return deal;

  const leavesClosing = deal.stageId === CLOSING_STAGE_ID && stageId !== CLOSING_STAGE_ID;
  if (!leavesClosing) return { ...deal, stageId };

  return {
    ...deal,
    stageId,
    closeStatus: undefined,
    probability: getStage(stageId)?.defaultProbability ?? deal.probability,
  };
}

/** Define el resultado del cierre y ajusta la probabilidad (Ganado → 100 %, Perdido → 0 %). */
export function setCloseStatus(deal: Deal, status: CloseStatus): Deal {
  return { ...deal, closeStatus: status, probability: CLOSE_STATUS_PROBABILITY[status] };
}

/** Probabilidad que el formulario sugiere para una etapa (y resultado, si está en Cierre). */
export function suggestedProbability(stageId: StageId, closeStatus?: CloseStatus): number {
  if (stageId === CLOSING_STAGE_ID && closeStatus) return CLOSE_STATUS_PROBABILITY[closeStatus];
  return getStage(stageId)?.defaultProbability ?? 0;
}

/**
 * Inserta o reubica un negocio en `stageId`, en la posición `index` relativa a esa columna,
 * conservando el orden del resto de la lista.
 */
export function moveDealInList(deals: Deal[], dealId: string, stageId: StageId, index: number): Deal[] {
  const moving = deals.find((d) => d.id === dealId);
  if (!moving) return deals;

  const updated = moveDealToStage(moving, stageId);
  const rest = deals.filter((d) => d.id !== dealId);
  const column = rest.filter((d) => d.stageId === stageId);
  const anchor = column[index];

  // Sin ancla va al final de la columna: justo después de su último negocio (o al final si está vacía).
  const last = column.at(-1);
  const at = anchor ? rest.indexOf(anchor) : last ? rest.indexOf(last) + 1 : rest.length;
  return [...rest.slice(0, at), updated, ...rest.slice(at)];
}
