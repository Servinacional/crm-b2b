import type { ActivityType, DealActivity } from "@/types/crm";

/** Autor por defecto mientras no exista autenticación de usuarios. */
export const DEFAULT_AUTHOR = "Comercial";

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  "Llamada",
  "Reunión",
  "Correo enviado",
  "Propuesta enviada",
  "Nota rápida",
];

export function createActivity(type: ActivityType, note: string, author = DEFAULT_AUTHOR): DealActivity {
  return {
    id: crypto.randomUUID(),
    type,
    note: note.trim(),
    author,
    createdAt: new Date().toISOString(),
  };
}

/** Copia ordenada de la más reciente a la más antigua. */
export function sortByNewest(activities: DealActivity[]): DealActivity[] {
  return [...activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
