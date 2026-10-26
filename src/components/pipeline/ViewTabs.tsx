import type { KeyboardEvent } from "react";
import { ChartColumnBig, SquareKanban, type LucideIcon } from "lucide-react";

export type PipelineTab = "kanban" | "report";

const TABS: { id: PipelineTab; label: string; icon: LucideIcon }[] = [
  { id: "kanban", label: "Tablero Kanban", icon: SquareKanban },
  { id: "report", label: "Informe Gerencial", icon: ChartColumnBig },
];

export const tabPanelId = (tab: PipelineTab) => `panel-${tab}`;
const tabId = (tab: PipelineTab) => `tab-${tab}`;

interface ViewTabsProps {
  active: PipelineTab;
  onChange: (tab: PipelineTab) => void;
}

export function ViewTabs({ active, onChange }: ViewTabsProps) {
  // Patrón WAI-ARIA de pestañas: flechas izquierda/derecha para moverse entre ellas.
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const index = TABS.findIndex((t) => t.id === active);
    const next = TABS[(index + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    onChange(next.id);
    document.getElementById(tabId(next.id))?.focus();
  };

  return (
    <div role="tablist" aria-label="Vista del pipeline" className="flex gap-6 border-b border-slate-200">
      {TABS.map(({ id, label, icon: Icon }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            id={tabId(id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={tabPanelId(id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={handleKeyDown}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-1 pb-2.5 text-sm font-medium transition ${
              selected
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export { tabId };
