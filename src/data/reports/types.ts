/** Tipos da área de clientes / reports digitais Mayven. */

export type Kpi = {
  label: string
  value: string
  description: string
}

export type ObjectiveStatus = 'Concluído' | 'Em evolução' | 'Planejado' | 'Pausado'

export type ReportData = {
  clientSlug: string
  clientName: string
  reportSlug: string
  monthLabel: string
  /** Código de acesso do report (MVP — troque aqui; não é segurança real) */
  accessCode: string
  type: 'status-report'
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    period: string
  }
  executiveSummary: {
    highlight: string
    kpis: Kpi[]
    mayvenReading: string
  }
  execution: {
    objectives: Array<{ objective: string; status: ObjectiveStatus; observation: string }>
  }
  deliverables: Kpi[]
  performance: {
    kpis: Kpi[]
    bars: Array<{ label: string; value: number }>
    worked: string
    attention: string
  }
  channels: Array<{ channel: string; role: string; reading: string }>
  topContent: Array<{ title: string; format: string; result: string; reading: string }>
  learnings: Array<{ title: string; description: string }>
  opportunities: Array<{ title: string; description: string }>
  recommendations: string[]
  dependencies: Array<{ need: string; owner: string; observation: string }>
  closing: {
    quote: string
    perceivedDelivery: string
    nextStep: { label: string; href: string }
  }
}

/* ---------- Plano de Execução mensal ---------- */

export type PlanData = {
  clientSlug: string
  clientName: string
  planSlug: string
  monthLabel: string
  type: 'execution-plan'
  /** Código de acesso do plano (MVP — troque aqui; não é segurança real) */
  accessCode: string
  /** Status Report que embasa este plano */
  basedOnReport: { label: string; href: string; month: string }
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    summary: string
  }
  strategicRationale: {
    title: string
    description: string
    signals: Array<{ signal: string; interpretation: string; decision: string }>
  }
  objectives: Array<{ title: string; description: string }>
  editorialBank: {
    title: string
    description: string
    pillars: Array<{ name: string; purpose: string; examples: string[] }>
  }
  programmaticContent: {
    title: string
    description: string
    series: Array<{ name: string; format: string; rationale: string; frequency: string }>
  }
  channelPlan: Array<{ channel: string; role: string; focus: string; expectedOutcome: string }>
  productionVolume: Kpi[]
  calendar: Array<{ week: string; focus: string; actions: string[]; objective: string }>
  experiments: Array<{ name: string; hypothesis: string; metric: string }>
  measurementPlan: {
    /** INTERNO (nunca exibido na interface do cliente):
     *  origem real dos dados — trocar para 'metricool-api' quando a integração existir. */
    dataSource: 'static-demo' | 'metricool-api'
    /** Badges exibidos ao cliente (ex.: "Fonte de dados · Metricool") */
    badges: string[]
    description: string
    /** Frase de fechamento do bloco, em destaque */
    complement: string
    metrics: string[]
  }
  productionPipeline: Array<{ step: string; owner: string; description: string }>
  dependencies: Array<{ need: string; owner: string; deadline: string; impact: string }>
  closing: {
    title: string
    description: string
    ctas: Array<{ label: string; href: string }>
  }
}

export type ClientEntry = {
  slug: string
  name: string
  reports: ReportData[]
  plans: PlanData[]
}
