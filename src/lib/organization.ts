import type { BpoModule, GroupCompany } from "@/types/crm";

export const GROUP_COMPANIES: readonly GroupCompany[] = ["Osya", "Aseoservicios", "Servinacional"];

/** Empresa del grupo que comercializa módulos BPO. */
export const BPO_COMPANY: GroupCompany = "Servinacional";

export const BPO_MODULES: readonly BpoModule[] = ["BPO Selección", "BPO Contratación", "BPO Nómina"];

/** Comerciales sugeridos en el formulario (también se aceptan nombres nuevos). */
export const SALES_REPS: readonly string[] = ["Juan Pérez", "María Gómez", "Carlos Rodríguez", "Ana Martínez"];

/**
 * Color de identidad de cada empresa del grupo (paleta categórica validada para daltonismo).
 * El color sigue a la empresa, nunca a su posición: filtrar no repinta las demás.
 */
export const COMPANY_COLORS: Record<GroupCompany, string> = {
  Osya: "#2a78d6",
  Aseoservicios: "#eb6834",
  Servinacional: "#1baf7a",
};

/** "BPO Contratación" → "Contratación", para etiquetas compactas. */
export function shortModuleName(module: BpoModule): string {
  return module.replace(/^BPO\s+/, "");
}

/** "María Gómez" → "MG" */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
