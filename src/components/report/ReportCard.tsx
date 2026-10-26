import type { ReactNode } from "react";

interface ReportCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

export function ReportCard({ title, subtitle, className = "", children }: ReportCardProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}>
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
