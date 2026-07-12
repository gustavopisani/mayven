/** Tipos da plataforma privada do cliente (hub de módulos + Brand System). */

export type ActiveModule = {
  id: string
  num: string
  name: string
  category: string
  desc: string
  complement: string
  status: string
  context: string[]
  cta: { label: string; href: string; external?: boolean }
  /** Qual visual abstrato o card usa */
  visual: 'brand' | 'website' | 'content' | 'media'
}

export type ExpansionModule = {
  id: string
  name: string
  desc: string
  possibilities: string[]
}

export type ActivityItem = {
  type: string
  date: string
  module: string
  href?: string
}

export type BrandSystemContent = {
  eyebrow: string
  title: string
  intro: string
  indicators: Array<{ label: string; value: string }>
  sections: {
    northStar: { title: string; copy: string }
    positioning: { title: string; copy: string; pillars: string[] }
    narrative: { title: string; copy: string; flow: string[] }
    valueProposition: { title: string; copy: string; cards: string[] }
    principles: { title: string; items: string[] }
    audiences: { title: string; groups: string[] }
    voice: {
      title: string
      axes: string[]
      microcopy: Array<{ avoid: string; prefer: string }>
    }
    territories: { title: string; items: string[] }
    application: { title: string; copy: string; targets: string[] }
    evolution: { title: string; copy: string; versions: Array<{ version: string; date: string; note: string }> }
  }
}

export type ClientPlatform = {
  clientSlug: string
  /** Código de acesso da área do cliente (hub + brand system) */
  accessCode: string
  currentCycle: string
  operationStatus: string
  /** Configurável — exibido nos indicadores do hero */
  lastUpdate: string
  websiteUrl: string
  websitePreview: {
    /** GIF animado com a prévia do site (loop infinito embutido no arquivo) */
    gif: string
  }
  hero: {
    titleLine1: string
    /** Destacada em magenta */
    titleLine2: string
    copy: string
  }
  systemMap: {
    nodes: string[]
    returnLabel: string
  }
  activeModules: ActiveModule[]
  expansion: {
    title: string
    copy: string
    note: string
    modules: ExpansionModule[]
  }
  activity: ActivityItem[]
  nextCycle: {
    period: string
    items: string[]
    copy: string
  }
  brandSystem: BrandSystemContent
}
