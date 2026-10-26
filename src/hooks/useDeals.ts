import { useState } from "react";
import type { CloseStatus, Deal, DealActivity, StageId } from "@/types/crm";
import { moveDealInList, setCloseStatus } from "@/lib/deal-rules";

/** Estado local de los negocios y las operaciones del pipeline. */
export function useDeals(initialDeals: Deal[]) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);

  const moveDeal = (dealId: string, stageId: StageId, index: number) => {
    setDeals((prev) => moveDealInList(prev, dealId, stageId, index));
  };

  const changeCloseStatus = (dealId: string, status: CloseStatus) => {
    setDeals((prev) => prev.map((d) => (d.id === dealId ? setCloseStatus(d, status) : d)));
  };

  /** Crea el negocio si su id no existe; si existe, lo reemplaza en su posición. */
  const saveDeal = (deal: Deal) => {
    setDeals((prev) =>
      prev.some((d) => d.id === deal.id) ? prev.map((d) => (d.id === deal.id ? deal : d)) : [...prev, deal],
    );
  };

  /** Registra una interacción al inicio de la bitácora del negocio. */
  const addActivity = (dealId: string, activity: DealActivity) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, activities: [activity, ...d.activities] } : d)),
    );
  };

  const deleteDeal = (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
  };

  return { deals, moveDeal, changeCloseStatus, saveDeal, addActivity, deleteDeal };
}
