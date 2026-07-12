/** Tracking V1 da área de clientes — apenas console estruturado.
 *  Pronto para futura integração com Firebase Analytics, Firestore ou API própria. */

export type ClientEvent =
  | 'client_gate_viewed'
  | 'client_access_granted'
  | 'client_access_denied'
  | 'report_opened'
  | 'section_viewed'
  | 'next_plan_clicked'
  | 'plan_opened'
  | 'plan_section_viewed'
  | 'previous_report_clicked'
  | 'plan_adjustment_clicked'
  | 'plan_approval_clicked'
  | 'hub_opened'
  | 'module_opened'
  | 'expansion_opened'
  | 'brand_system_opened'
  | 'session_locked'

export function trackClientEvent(eventName: ClientEvent, payload?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.log('[mayven:client]', eventName, payload ?? {})
  }
  // Futuro: enviar para Firebase Analytics / Firestore / endpoint próprio.
}

/** @deprecated use trackClientEvent — mantido para os componentes de report existentes. */
export const trackReportEvent = trackClientEvent
export type ReportEvent = ClientEvent
