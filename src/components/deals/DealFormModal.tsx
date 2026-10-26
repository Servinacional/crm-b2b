"use client";

import { useId, useState, type FormEvent } from "react";
import { Save, Trash2 } from "lucide-react";
import type {
  ActivityType,
  BpoModule,
  CloseStatus,
  Deal,
  DealActivity,
  GroupCompany,
  StageId,
  ValuePeriod,
} from "@/types/crm";
import { CLOSING_STAGE_ID, PIPELINE_STAGES, isStageId } from "@/lib/pipeline";
import { suggestedProbability } from "@/lib/deal-rules";
import { addDaysFromToday } from "@/lib/dates";
import { DEFAULT_AUTHOR, createActivity } from "@/lib/activities";
import { BPO_COMPANY, BPO_MODULES, GROUP_COMPANIES } from "@/lib/organization";
import { Modal } from "@/components/ui/Modal";
import { ActivityLog } from "@/components/activities/ActivityLog";
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
  /** Registra una interacción en la bitácora del negocio de inmediato (sin esperar a "Guardar"). */
  onAddActivity: (dealId: string, activity: DealActivity) => void;
  /** Nombres sugeridos para "Comercial responsable". */
  ownerSuggestions: string[];
  onClose: () => void;
}

interface FormValues {
  title: string;
  companyName: string;
  contactName: string;
  owner: string;
  groupCompany?: GroupCompany;
  /** Se conserva al cambiar de empresa para no perder la selección; solo se guarda si es Servinacional. */
  bpoModules: BpoModule[];
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
      owner: "",
      bpoModules: [],
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

type FieldErrors = Partial<Record<"title" | "owner" | "groupCompany" | "bpoModules", string>>;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.title.trim()) errors.title = "El título del negocio es obligatorio.";
  if (!values.groupCompany) errors.groupCompany = "Selecciona la empresa del grupo.";
  if (!values.owner.trim()) errors.owner = "Indica el comercial responsable.";
  if (values.groupCompany === BPO_COMPANY && values.bpoModules.length === 0) {
    errors.bpoModules = "Selecciona al menos un módulo BPO.";
  }
  return errors;
}

function toDeal(values: FormValues, groupCompany: GroupCompany, id: string, activities: DealActivity[]): Deal {
  const isClosing = values.stageId === CLOSING_STAGE_ID;
  const notes = values.diagnosticNotes.trim();
  return {
    id,
    title: values.title.trim(),
    companyName: values.companyName.trim(),
    contactName: values.contactName.trim(),
    owner: values.owner.trim(),
    groupCompany,
    // Orden canónico de módulos, independiente del orden en que se marcaron.
    bpoModules: groupCompany === BPO_COMPANY ? BPO_MODULES.filter((m) => values.bpoModules.includes(m)) : [],
    stageId: values.stageId,
    probability: values.probability,
    estimatedValue: Number(values.estimatedValue || 0),
    valuePeriod: values.valuePeriod,
    targetCloseDate: values.targetCloseDate,
    diagnosticNotes: notes || undefined,
    closeStatus: isClosing ? values.closeStatus : undefined,
    activities,
  };
}

const clampProbability = (n: number) => Math.min(100, Math.max(0, Math.round(n || 0)));

export function DealFormModal({
  deal,
  onSave,
  onDelete,
  onAddActivity,
  ownerSuggestions,
  onClose,
}: DealFormModalProps) {
  const isEditing = Boolean(deal);
  const [values, setValues] = useState<FormValues>(() => toFormValues(deal));
  const [activities, setActivities] = useState<DealActivity[]>(() => deal?.activities ?? []);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const formId = useId();
  const ids = {
    title: `${formId}-title`,
    groupCompany: `${formId}-group-company`,
    owner: `${formId}-owner`,
    ownerList: `${formId}-owner-list`,
    bpo: `${formId}-bpo`,
    company: `${formId}-company`,
    contact: `${formId}-contact`,
    value: `${formId}-value`,
    stage: `${formId}-stage`,
    probability: `${formId}-probability`,
    date: `${formId}-date`,
    notes: `${formId}-notes`,
  };

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleBpoModule = (module: BpoModule) =>
    set(
      "bpoModules",
      values.bpoModules.includes(module)
        ? values.bpoModules.filter((m) => m !== module)
        : [...values.bpoModules, module],
    );

  const isClosing = values.stageId === CLOSING_STAGE_ID;
  const suggested = suggestedProbability(values.stageId, values.closeStatus);

  const handleStageChange = (raw: string) => {
    const stageId = Number(raw);
    if (!isStageId(stageId)) return;
    // La probabilidad es criterio del comercial: cambiar de etapa no la modifica
    // (la referencia de la etapa se ofrece como sugerencia junto al campo).
    setValues((prev) => ({
      ...prev,
      stageId,
      closeStatus: stageId === CLOSING_STAGE_ID ? prev.closeStatus : undefined,
    }));
  };

  const handleCloseStatusChange = (closeStatus: CloseStatus) => {
    setValues((prev) => ({ ...prev, closeStatus, probability: suggestedProbability(prev.stageId, closeStatus) }));
  };

  // La nota se muestra al instante y se registra en el tablero en ese momento,
  // para que cerrar el modal sin guardar no borre una interacción ya ocurrida.
  const handleAddActivity = (type: ActivityType, note: string) => {
    if (!deal) return;
    // Sin autenticación, el autor por defecto es el comercial responsable del negocio.
    const activity = createActivity(type, note, values.owner.trim() || DEFAULT_AUTHOR);
    setActivities((prev) => [activity, ...prev]);
    onAddActivity(deal.id, activity);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length > 0 || !values.groupCompany) {
      setErrors(found);
      // Enfoca el primer campo inválido, en el orden visual del formulario.
      const firstInvalid = (["title", "groupCompany", "owner", "bpoModules"] as const).find((k) => found[k]);
      const target = firstInvalid === "bpoModules" ? `${ids.bpo}-0` : firstInvalid && ids[firstInvalid];
      if (target) document.getElementById(target)?.focus();
      return;
    }
    onSave(toDeal(values, values.groupCompany, deal?.id ?? crypto.randomUUID(), activities));
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Editar negocio" : "Nuevo negocio"}
      description={isEditing ? deal?.companyName || undefined : "Registra la oportunidad en el pipeline."}
      size={isEditing ? "xl" : "md"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        {/* En edición y pantallas grandes: campos a la izquierda y bitácora a la derecha, cada uno con su scroll. */}
        <div
          className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${isEditing ? "lg:flex-row lg:overflow-hidden" : ""}`}
        >
          <div
            className={`grid grid-cols-1 content-start gap-4 px-6 py-5 sm:grid-cols-2 ${isEditing ? "lg:flex-1 lg:overflow-y-auto" : ""}`}
          >
            <FormField label="Título del negocio" htmlFor={ids.title} required error={errors.title} className="sm:col-span-2">
              <input
                id={ids.title}
                data-autofocus
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Ej. Outsourcing Selección de Personal"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? `${ids.title}-error` : undefined}
                className={inputClass}
              />
            </FormField>

            <FormField label="Empresa del grupo" htmlFor={ids.groupCompany} required error={errors.groupCompany}>
              <select
                id={ids.groupCompany}
                value={values.groupCompany ?? ""}
                onChange={(e) => set("groupCompany", (e.target.value || undefined) as GroupCompany | undefined)}
                aria-invalid={Boolean(errors.groupCompany)}
                aria-describedby={errors.groupCompany ? `${ids.groupCompany}-error` : undefined}
                className={`${inputClass} ${values.groupCompany ? "" : "text-slate-400"}`}
              >
                <option value="" disabled>
                  Selecciona…
                </option>
                {GROUP_COMPANIES.map((company) => (
                  <option key={company} value={company} className="text-slate-900">
                    {company}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Comercial responsable" htmlFor={ids.owner} required error={errors.owner}>
              <input
                id={ids.owner}
                list={ids.ownerList}
                value={values.owner}
                onChange={(e) => set("owner", e.target.value)}
                placeholder="Ej. María Gómez"
                autoComplete="off"
                aria-invalid={Boolean(errors.owner)}
                aria-describedby={errors.owner ? `${ids.owner}-error` : undefined}
                className={inputClass}
              />
              <datalist id={ids.ownerList}>
                {ownerSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </FormField>

            {values.groupCompany === BPO_COMPANY && (
              <fieldset
                className="sm:col-span-2"
                aria-describedby={errors.bpoModules ? `${ids.bpo}-error` : undefined}
              >
                <legend className="mb-1.5 text-xs font-medium text-slate-600">
                  Módulos BPO<span className="ml-0.5 text-rose-500">*</span>
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {BPO_MODULES.map((module, i) => {
                    const checked = values.bpoModules.includes(module);
                    return (
                      <label
                        key={module}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                          checked
                            ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          id={`${ids.bpo}-${i}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBpoModule(module)}
                          className="size-4 rounded accent-indigo-600"
                        />
                        {module}
                      </label>
                    );
                  })}
                </div>
                {errors.bpoModules && (
                  <p id={`${ids.bpo}-error`} className="mt-1 text-xs text-rose-600">
                    {errors.bpoModules}
                  </p>
                )}
              </fieldset>
            )}

            <FormField label="Empresa cliente" htmlFor={ids.company}>
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
                    Referencia para esta etapa: {suggested}%.{" "}
                    <button
                      type="button"
                      onClick={() => set("probability", suggested)}
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Aplicar
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

          <aside
            className={`border-t border-slate-100 bg-slate-50/70 px-6 py-5 ${
              isEditing ? "lg:w-[25rem] lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0" : ""
            }`}
          >
            <ActivityLog
              activities={isEditing ? activities : undefined}
              onAdd={isEditing ? handleAddActivity : undefined}
            />
          </aside>
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
                  aria-label="Eliminar negocio"
                  title="Eliminar negocio"
                  className="mr-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 className="size-4" aria-hidden />
                  <span className="hidden sm:inline">Eliminar negocio</span>
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
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
