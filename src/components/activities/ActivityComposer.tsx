"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import type { ActivityType } from "@/types/crm";
import { ACTIVITY_TYPES } from "@/lib/activities";
import { inputClass } from "@/components/deals/FormField";

interface ActivityComposerProps {
  onAdd: (type: ActivityType, note: string) => void;
}

/**
 * Formulario de nueva nota. No es un <form> porque vive dentro del formulario del negocio
 * (los formularios anidados no son HTML válido): se envía con el botón o con Ctrl/⌘ + Enter.
 */
export function ActivityComposer({ onAdd }: ActivityComposerProps) {
  const [type, setType] = useState<ActivityType>(ACTIVITY_TYPES[0]);
  const [note, setNote] = useState("");
  const id = useId();
  const canAdd = note.trim().length > 0;

  const add = () => {
    if (!canAdd) return;
    onAdd(type, note);
    setNote("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <label htmlFor={`${id}-type`} className="sr-only">
        Tipo de actividad
      </label>
      <select
        id={`${id}-type`}
        value={type}
        onChange={(e) => setType(e.target.value as ActivityType)}
        className={`${inputClass} py-1.5 text-xs font-medium`}
      >
        {ACTIVITY_TYPES.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <label htmlFor={`${id}-note`} className="sr-only">
        Texto de la nota
      </label>
      <textarea
        id={`${id}-note`}
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            add();
          }
        }}
        placeholder="Acuerdo, feedback del cliente o siguiente paso…"
        className={`${inputClass} mt-2 resize-none`}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">Ctrl + Enter para agregar</span>
        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus className="size-3.5" aria-hidden />
          Agregar Nota
        </button>
      </div>
    </div>
  );
}
