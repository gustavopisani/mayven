import type { ClientEntry, PlanData, ReportData } from './reports/types'
import type { ClientPlatform } from './platform/types'
import { galpaoAnimalJunho2026Report } from './reports/galpao-animal/junho-2026'
import { galpaoAnimalJulho2026Plan } from './plans/galpao-animal/julho-2026'
import { galpaoAnimalPlatform } from './platform/galpao-animal'

/**
 * REGISTRY DA ÁREA DE CLIENTES
 * Para adicionar um novo report/plano: crie o arquivo de dados em
 * src/data/reports/<cliente>/<slug>.ts (ou src/data/plans/...) e registre-o abaixo.
 * Para um novo cliente: adicione uma nova entrada com slug/name/reports/plans.
 */
export const clients: ClientEntry[] = [
  {
    slug: 'galpao-animal',
    name: 'Galpão Animal',
    reports: [galpaoAnimalJunho2026Report],
    plans: [galpaoAnimalJulho2026Plan],
  },
]

export const findClient = (clientSlug: string): ClientEntry | undefined =>
  clients.find((c) => c.slug === clientSlug)

export const findReport = (clientSlug: string, reportSlug: string): ReportData | undefined =>
  findClient(clientSlug)?.reports.find((r) => r.reportSlug === reportSlug)

export const findPlan = (clientSlug: string, planSlug: string): PlanData | undefined =>
  findClient(clientSlug)?.plans.find((p) => p.planSlug === planSlug)

/* Plataforma (hub de módulos) por cliente — clientes sem config caem na listagem simples. */
const platforms: ClientPlatform[] = [galpaoAnimalPlatform]

export const findPlatform = (clientSlug: string): ClientPlatform | undefined =>
  platforms.find((p) => p.clientSlug === clientSlug)
