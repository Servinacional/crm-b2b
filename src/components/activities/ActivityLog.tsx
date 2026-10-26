"use client";

import { History, MessageSquareDashed } from "lucide-react";
import type { ActivityType, DealActivity } from "@/types/crm";
import { sortByNewest } from "@/lib/activities";
import { formatActivityTime } from "@/lib/format";
import { useNow } from "@/hooks/useNow";
import { ActivityComposer } from "./ActivityComposer";
import { ActivityItem } from "./ActivityItem";

interface ActivityLogProps {
  /** Ausente para un negocio nuevo sin guardar: la bitácora aún no está disponible. */
  activities?: DealActivity[];
  onAdd?: (type: ActivityType, note: string) => void;
}

export function ActivityLog({ activities, onAdd }: ActivityLogProps) {
  const now = useNow();
  const isAvailable = activities !== undefined && onAdd !== undefined;
  const sorted = isAvailable ? sortByNewest(activities) : [];
  const latest = sorted[0];

  return (
    <section aria-labelledby="activity-log-title" className="flex flex-col gap-3">
      <header className="flex items-center gap-2">
        <History className="size-4 text-slate-400" aria-hidden />
        <h3 id="activity-log-title" className="text-sm font-semibold text-slate-800">
          Bitácora de Seguimiento
        </h3>
        {isAvailable && sorted.length > 0 && (
          <span className="ml-auto rounded-md bg-white px-1.5 text-xs font-medium tabular-nums text-slate-500 ring-1 ring-slate-200">
            {sorted.length}
          </span>
        )}
      </header>

      {!isAvailable ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">
          La bitácora estará disponible cuando crees el negocio. Así podrás registrar llamadas, reuniones y
          acuerdos con el cliente.
        </p>
      ) : (
        <>
          {/* Resumen para entender el estado del cliente de un vistazo. */}
          {latest && (
            <p className="text-xs text-slate-500">
              Último contacto:{" "}
              <span className="font-medium text-slate-700">
                {formatActivityTime(latest.createdAt, now).toLowerCase()} · {latest.type}
              </span>
            </p>
          )}

          <ActivityComposer onAdd={onAdd} />

          {sorted.length > 0 ? (
            <ol aria-label="Interacciones registradas" className="pt-1">
              {sorted.map((activity, i) => (
                <ActivityItem key={activity.id} activity={activity} now={now} isLast={i === sorted.length - 1} />
              ))}
            </ol>
          ) : (
            <p className="flex flex-col items-center gap-1.5 py-6 text-center text-xs text-slate-400">
              <MessageSquareDashed className="size-5" aria-hidden />
              Aún no hay interacciones. Registra la primera arriba.
            </p>
          )}
        </>
      )}
    </section>
  );
}
