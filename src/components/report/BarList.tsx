import type { ReactNode } from "react";

export interface BarItem {
  key: string;
  label: ReactNode;
  value: number;
  /** Texto en la punta de la barra (valor visible sin hover). */
  valueLabel: string;
  /** Detalle adicional en el tooltip (hover y foco de teclado). */
  tooltip: { title: string; lines: string[] };
}

interface BarListProps {
  items: BarItem[];
  color?: string;
  ariaLabel: string;
}

/**
 * Barras horizontales de una sola serie (magnitud): 16px de grosor, extremo de dato
 * redondeado y base recta sobre una línea base común. El valor va en la punta y el
 * detalle en un tooltip accesible por hover y teclado.
 */
export function BarList({ items, color = "#2a78d6", ariaLabel }: BarListProps) {
  const max = Math.max(...items.map((i) => i.value), 0);

  return (
    <ul aria-label={ariaLabel} className="space-y-2.5">
      {items.map((item) => {
        const share = max > 0 ? item.value / max : 0;
        return (
          <li
            key={item.key}
            tabIndex={0}
            aria-label={`${item.tooltip.title}. ${item.tooltip.lines.join(". ")}`}
            className="group relative grid grid-cols-1 gap-1 rounded-md sm:grid-cols-[minmax(0,10rem)_1fr] sm:items-center sm:gap-3 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span className="truncate text-xs text-slate-600">{item.label}</span>
            <div className="flex h-6 items-center border-l border-slate-300">
              {item.value > 0 && (
                <div
                  className="h-4 rounded-r-[4px] transition-[filter] group-hover:brightness-110"
                  // Se reserva espacio para la etiqueta en la punta para que nunca se recorte.
                  style={{ width: `max(2px, calc((100% - 7.5rem) * ${share}))`, backgroundColor: color }}
                />
              )}
              <span className="ml-2 whitespace-nowrap text-xs font-medium tabular-nums text-slate-700">
                {item.valueLabel}
              </span>
            </div>

            <div
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-0 z-10 sm:left-[min(10.75rem,40%)] mb-1 hidden min-w-44 rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-300 shadow-lg group-hover:block group-focus-visible:block"
            >
              <p className="text-sm font-semibold text-white">{item.tooltip.title}</p>
              {item.tooltip.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
