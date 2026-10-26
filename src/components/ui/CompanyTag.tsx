import type { GroupCompany } from "@/types/crm";
import { COMPANY_COLORS } from "@/lib/organization";

/** Empresa del grupo: punto de color de identidad + nombre (el color nunca va solo). */
export function CompanyTag({ company, className = "" }: { company: GroupCompany; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-slate-600 ${className}`}>
      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: COMPANY_COLORS[company] }} aria-hidden />
      {company}
    </span>
  );
}
