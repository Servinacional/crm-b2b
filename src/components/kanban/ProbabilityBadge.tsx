interface ProbabilityBadgeProps {
  value: number;
}

function getTone(value: number): string {
  if (value >= 70) return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
  if (value >= 40) return "bg-amber-50 text-amber-700 ring-amber-600/15";
  return "bg-slate-100 text-slate-600 ring-slate-500/15";
}

export function ProbabilityBadge({ value }: ProbabilityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ring-1 ring-inset ${getTone(value)}`}
      title={`Probabilidad de cierre: ${value}%`}
    >
      {value}%
    </span>
  );
}
