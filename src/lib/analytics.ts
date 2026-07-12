/** Stub de analytics para propostas — sem ferramenta instalada nesta versão.
 *  Em dev loga no console; em produção fica pronto para integração futura. */

export type ProposalEvent =
  | 'proposal_viewed'
  | 'section_viewed'
  | 'cta_clicked'
  | 'proposal_completed'

export function trackProposalEvent(eventName: ProposalEvent, payload?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.debug('[proposal]', eventName, payload ?? {})
  }
  // Futuro: enviar para GA4 / Plausible / endpoint próprio.
}
