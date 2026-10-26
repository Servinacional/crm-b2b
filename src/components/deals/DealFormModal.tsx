"use client";

import { useId, useState, type FormEvent } from "react";
import { Save, Trash2 } from "lucide-react";
import type { CloseStatus, Deal, StageId, ValuePeriod } from "@/types/crm";
import { CLOSING_STAGE_ID, PIPELINE_STAGES, isStageId } from "@/lib/pipeline";
import { suggestedProbability } from "@/lib/deal-rules";
import { addDaysFromToday } from "@/lib/dates";
import { Modal } from "@/components/ui/Modal";
import { CloseStatusSelector } from "@/components/kanban/CloseStatusSelector";
import { ProbabilityBadge } from "@/components/kanban/ProbabilityBadge";
import { FormField, inputClass } from "./FormField";

const DEFAULT_CLOSE_IN_DAYS = 30;
const PERIODS: ValuePeriod[] = ["Mensual", "Anual"];

interface DealFormModalProps {
  /** Negocio a editar; si se omite, el modal crea uno nuevo. */
  deal?: Deal;
  onSave: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
  onClose: () => void;
}

interface FormValues {
  title: string;
  companyName: string;
  contactName: string;
  /** Solo dígitos, para poder mostrarlo con separadores de miles. */
  estimatedValue: string;
  valuePeriod: ValuePeriod;
  stageId: StageId;
  probability: number;
  closeStatus?: CloseStatus;
  targetCloseDate: string;
  diagnosticNotes: string;
}

function toFormValues(deal?: Deal): FormValues {
  if (!deal) {
    return {
      title: "",
      companyName: "",
      contactName: "",
      estimatedValue: "",
      valuePeriod: "Mensual",
      stageId: 1,
      probability: suggestedProbability(1),
      targetCloseDate: addDaysFromToday(DEFAULT_CLOSE_IN_DAYS),
      diagnosticNotes: "",
    };
  }
  return {
    ...deal,
    estimatedValue: String(deal.estimatedValue),
    diagnosticNotes: deal.diagnosticNotes ?? "",
  };
}

function toDeal(values: FormValues, id: string): Deal {
  const isClosing = values.stageId === CLOSING_STAGE_ID;
  const notes = values.diagnosticNotes.trim();
  return {
    id,
    title: values.title.trim(),
    companyName: values.companyName.trim(),
    contactName: values.contactName.trim(),
    stageId: values.stageId,
    probability: values.probability,
    estimatedValue: Number(values.estimatedValue || 0),
    valuePeriod: values.valuePeriod,
    targetCloseDate: values.targetCloseDate,
    diagnosticNotes: notes || undefined,
    closeStatus: isClosing ? values.closeStatus : undefined,
  };
}

const clampProbability = (n: number) => Math.min(100, Math.max(0, Math.round(n || 0)));

export function DealFormModal({ deal, onSave, onDelete, onClose }: DealFormModalProps) {
  const isEditing = Boolean(deal);
  const [values, setValues] = useState<FormValues>(() => toFormValues(deal));
  const [titleError, setTitleError] = useState<string>();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const formId = useId();
  const ids = {
    title: `${formId}-title`,
    company: `${formId}-company`,
    contact: `${formId}-contact`,
    value: `${formId}-value`,
    stage: `${formId}-stage`,
    probability: `${formId}-probability`,
    date: `${formId}-date`,
    notes: `${formId}-notes`,
  };

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const isClosing = values.stageId === CLOSING_STAGE_ID;
  const suggested = suggestedProbability(values.stageId, values.closeStatus);

  const handleStageChange = (raw: string) => {
    const stageId = Number(raw);
    if (!isStageId(stageId)) return;
    // Cambiar de etapa propone su probabilidad por defecto; el usuario puede ajustarla después.
    setValues((prev) => {
      const closeStatus = stageId === CLOSING_STAGE_ID ? prev.closeStatus : undefined;
      return { ...prev, stageId, closeStatus, probability: suggestedProbability(stageId, closeStatus) };
    });
  };

  const handleCloseStatusChange = (closeStatus: CloseStatus) => {
    setValues((prev) => ({ ...prev, closeStatus, probability: suggestedProbability(prev.stageId, closeStatus) }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setTitleError("El título del negocio es obligatorio.");
      document.getElementById(ids.title)?.focus();
      return;
    }
    onSave(toDeal(values, deal?.id ?? crypto.randomUUID()));
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Editar negocio" : "Nuevo negocio"}
      description={isEditing ? deal?.companyName || undefined : "Registra la oportunidad en el pipeline."}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <FormField label="Título del negocio" htmlFor={ids.title} required error={titleError} className="sm:col-span-2">
            <input
              id={ids.title}
              data-autofocus
              value={values.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (titleError) setTitleError(undefined);
              }}
              placeholder="Ej. Outsourcing Selección de Personal"
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? `${ids.title}-error` : undefined}
              className={inputClass}
            />
          </FormField>

          <FormField label="Empresa" htmlFor={ids.company}>
            <input
              id={ids.company}
              value={values.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              placeholder="Ej. Textiles Medellín S.A."
              className={inputClass}
            />
          </FormField>

          <FormField label="Contacto principal" htmlFor={ids.contact}>
            <input
              id={ids.contact}
              value={values.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              placeholder="Nombre y apellido"
              className={inputClass}
            />
          </FormField>

          <FormField label="Valor estimado" htmlFor={ids.value} className="sm:col-span-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
                  $
                </span>
                <input
                  id={ids.value}
                  inputMode="numeric"
                  value={values.estimatedValue ? Number(values.estimatedValue).toLocaleString("es-CO") : ""}
                  onChange={(e) => set("estimatedValue", e.target.value.replace(/\D/g, "").slice(0, 13))}
                  placeholder="0"
                  className={`${inputClass} pl-7 pr-14 tabular-nums`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                  COP
                </span>
              </div>
              <div role="radiogroup" aria-label="Periodicidad" className="flex rounded-lg bg-slate-100 p-1">
                {PERIODS.map((period) => (
                  <button
                    key={period}
                    type="button"
                    role="radio"
                    aria-checked={values.valuePeriod === period}
                    onClick={() => set("valuePeriod", period)}
                    className={`rounded-md px-3 text-xs font-medium transition ${
                      values.valuePeriod === period
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </FormField>

          <FormField label="Etapa del pipeline" htmlFor={ids.stage}>
            <select
              id={ids.stage}
              value={values.stageId}
              onChange={(e) => handleStageChange(e.target.value)}
              className={inputClass}
            >
              {PIPELINE_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.id}. {stage.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Fecha objetivo de cierre" htmlFor={ids.date}>
            <input
              id={ids.date}
              type="date"
              value={values.targetCloseDate}
              onChange={(e) => set("targetCloseDate", e.target.value)}
              className={inputClass}
            />
          </FormField>

          {isClosing && (
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-xs font-medium text-slate-600">Resultado del cierre</p>
              <CloseStatusSelector value={values.closeStatus} onChange={handleCloseStatusChange} />
            </div>
          )}

          <FormField
            label="Probabilidad de cierre"
            htmlFor={ids.probability}
            className="sm:col-span-2"
            hint={
              values.probability !== suggested && (
                <>
                  Sugerido para esta etapa: {suggested}%.{" "}
                  <button
                    type="button"
                    onClick={() => set("probability", suggested)}
                    className="font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Restablecer
                  </button>
                </>
              )
            }
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={values.probability}
                onChange={(e) => set("probability", Number(e.target.value))}
                aria-label="Probabilidad de cierre (deslizador)"
                className="h-1.5 flex-1 cursor-pointer accent-indigo-600"
              />
              <div className="relative w-20">
                <input
                  id={ids.probability}
                  type="number"
                  min={0}
                  max={100}
                  value={values.probability}
                  onChange={(e) => set("probability", clampProbability(Number(e.target.value)))}
                  className={`${inputClass} pr-7 text-right tabular-nums`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
                  %
                </span>
              </div>
              <ProbabilityBadge value={values.probability} />
            </div>
          </FormField>

          <FormField label="Notas de diagnóstico" htmlFor={ids.notes} className="sm:col-span-2">
            <textarea
              id={ids.notes}
              rows={3}
              value={values.diagnosticNotes}
              onChange={(e) => set("diagnosticNotes", e.target.value)}
              placeholder="Situación actual del cliente, dolores, procesos manuales, decisores…"
              className={`${inputClass} resize-y`}
            />
          </FormField>
        </div>

        <footer className="border-t border-slate-100 bg-slate-50/60 px-6 py-3">
          {confirmingDelete ? (
            <div role="alertdialog" aria-label="Confirmar eliminación" className="flex flex-wrap items-center gap-3">
              <p className="mr-auto text-sm text-slate-700">
                ¿Eliminar este negocio? <span className="text-slate-500">No se puede deshacer.</span>
              </p>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => {
                  if (deal) onDelete(deal.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-rose-700"
              >
                <Trash2 className="size-4" aria-hidden />
                Sí, eliminar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="mr-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Eliminar negocio
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Save className="size-4" aria-hidden />
                {isEditing ? "Guardar cambios" : "Crear negocio"}
              </button>
            </div>
          )}
        </footer>
      </form>
    </Modal>
  );
}
