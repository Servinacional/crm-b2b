import { CircleCheck, CircleX } from "lucide-react";
import type { CloseStatus } from "@/types/crm";

interface CloseStatusSelectorProps {
  value?: CloseStatus;
  onChange: (status: CloseStatus) => void;
}

const OPTIONS: { status: CloseStatus; icon: typeof CircleCheck; active: string }[] = [
  { status: "Ganado", icon: CircleCheck, active: "bg-emerald-600 text-white ring-emerald-600" },
  { status: "Perdido", icon: CircleX, active: "bg-rose-600 text-white ring-rose-600" },
];

export function CloseStatusSelector({ value, onChange }: CloseStatusSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Resultado del cierre" className="flex gap-1.5">
      {OPTIONS.map(({ status, icon: Icon, active }) => {
        const selected = value === status;
        return (
          <button
            key={status}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(status)}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition ${
              selected ? active : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Icon className="size-3.5" aria-hidden />
            {status}
          </button>
        );
      })}
    </div>
  );
}
