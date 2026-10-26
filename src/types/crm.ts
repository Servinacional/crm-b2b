export type CompanySize = "Micro" | "Pequeña" | "Mediana" | "Grande";

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: CompanySize;
}

export interface Contact {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  companyId: Company["id"];
}

/** Identificador de etapa del pipeline (1 a 6). */
export type StageId = 1 | 2 | 3 | 4 | 5 | 6;

export type ValuePeriod = "Mensual" | "Anual";

/** Resultado de un negocio en la etapa de cierre. */
export type CloseStatus = "Ganado" | "Perdido";

export type ActivityType = "Llamada" | "Reunión" | "Correo enviado" | "Propuesta enviada" | "Nota rápida";

/** Entrada de la bitácora de seguimiento de un negocio. */
export interface DealActivity {
  id: string;
  type: ActivityType;
  note: string;
  author: string;
  /** Fecha y hora ISO 8601. */
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  companyName: string;
  contactName: string;
  stageId: StageId;
  /** Porcentaje de 0 a 100. */
  probability: number;
  /** Monto en COP. */
  estimatedValue: number;
  valuePeriod: ValuePeriod;
  /** Formato YYYY-MM-DD. */
  targetCloseDate: string;
  diagnosticNotes?: string;
  /** Solo aplica cuando stageId es la etapa de cierre. */
  closeStatus?: CloseStatus;
  /** Bitácora de seguimiento, de la más reciente a la más antigua. */
  activities: DealActivity[];
}

export interface PipelineStage {
  id: StageId;
  name: string;
  /** Color de acento (clase Tailwind) para identificar la etapa. */
  accent: string;
  /**
   * Probabilidad sugerida para la etapa: se aplica al regresar un negocio desde Cierre
   * y se propone en el formulario al elegir la etapa. En Cierre, el resultado
   * (Ganado/Perdido) tiene prioridad sobre este valor.
   */
  defaultProbability: number;
}
