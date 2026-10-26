import { CalendarDays, FileText, Mail, Phone, StickyNote, type LucideIcon } from "lucide-react";
import type { ActivityType } from "@/types/crm";

/** Ícono y color de cada tipo de actividad: permiten escanear la bitácora sin leer. */
export const ACTIVITY_STYLES: Record<ActivityType, { icon: LucideIcon; tone: string }> = {
  Llamada: { icon: Phone, tone: "bg-sky-50 text-sky-600 ring-sky-600/15" },
  Reunión: { icon: CalendarDays, tone: "bg-violet-50 text-violet-600 ring-violet-600/15" },
  "Correo enviado": { icon: Mail, tone: "bg-amber-50 text-amber-600 ring-amber-600/15" },
  "Propuesta enviada": { icon: FileText, tone: "bg-emerald-50 text-emerald-600 ring-emerald-600/15" },
  "Nota rápida": { icon: StickyNote, tone: "bg-slate-100 text-slate-500 ring-slate-500/15" },
};
