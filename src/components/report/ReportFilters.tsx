import type { GroupCompany } from "@/types/crm";
import { ALL_COMPANIES, ALL_OWNERS, type DealFilters } from "@/lib/metrics";
import { COMPANY_COLORS, GROUP_COMPANIES } from "@/lib/organization";

interface ReportFiltersProps {
  filters: DealFilters;
  owners: string[];
  onChange: (filters: DealFilters) => void;
}

const COMPANY_OPTIONS: { value: DealFilters["company"]; label: string }[] = [
  { value: ALL_COMPANIES, label: "Consolidado Grupo" },
  ...GROUP_COMPANIES.map((company) => ({ value: company, label: company })),
];

export function ReportFilters({ filters, owners, onChange }: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="radiogroup" aria-label="Empresa del grupo" className="flex flex-wrap rounded-lg bg-slate-200/60 p-1">
        {COMPANY_OPTIONS.map(({ value, label }) => {
          const selected = filters.company === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange({ ...filters, company: value })}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                selected ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {value !== ALL_COMPANIES && (
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: COMPANY_COLORS[value as GroupCompany] }}
                  aria-hidden
                />
              )}
              {label}
            </button>
          );
        })}
      </div>

      <label className="sr-only" htmlFor="report-owner">
        Comercial responsable
      </label>
      <select
        id="report-owner"
        value={filters.owner}
        onChange={(e) => onChange({ ...filters, owner: e.target.value })}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <option value={ALL_OWNERS}>Todos los comerciales</option>
        {owners.map((owner) => (
          <option key={owner} value={owner}>
            {owner}
          </option>
        ))}
      </select>

      {(filters.company !== ALL_COMPANIES || filters.owner !== ALL_OWNERS) && (
        <button
          type="button"
          onClick={() => onChange({ company: ALL_COMPANIES, owner: ALL_OWNERS })}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
