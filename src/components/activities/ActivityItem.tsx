import type { DealActivity } from "@/types/crm";
import { formatActivityTime, formatDateTime } from "@/lib/format";
import { ACTIVITY_STYLES } from "./activityStyles";

interface ActivityItemProps {
  activity: DealActivity;
  now: number;
  isLast: boolean;
}

export function ActivityItem({ activity, now, isLast }: ActivityItemProps) {
  const { icon: Icon, tone } = ACTIVITY_STYLES[activity.type];

  return (
    <li className="relative flex gap-3 pb-4">
      {/* Línea de tiempo que une los íconos. */}
      {!isLast && <span className="absolute left-3.5 top-8 -bottom-0 w-px bg-slate-200" aria-hidden />}
      <span className={`relative flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${tone}`}>
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold text-slate-800">{activity.type}</p>
          <time
            dateTime={activity.createdAt}
            title={formatDateTime(activity.createdAt, true)}
            className="shrink-0 text-[11px] text-slate-400"
          >
            {formatActivityTime(activity.createdAt, now)}
          </time>
        </div>
        <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-snug text-slate-700">{activity.note}</p>
        <p className="mt-1 text-[11px] text-slate-400">{activity.author}</p>
      </div>
    </li>
  );
}
