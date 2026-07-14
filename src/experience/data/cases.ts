/* Cases editoriais — fonte de dados única.
   REGRA: nunca apresentar cliente fictício como real nem inventar métricas.
   Cases conceituais são sempre rotulados como CASE CONCEITUAL. Campos vazios
   ficam vazios; o componente esconde o que não existe. */

export type CaseMedia = { src: string; alt: string; kind: 'image' | 'video' }

export type CaseStudy = {
  slug: string
  title: string
  client?: string
  area: string // ex.: 'Experiência digital · Plataforma'
  status: 'EM OPERAÇÃO' | 'EM ANDAMENTO' | 'EM BREVE' | 'CASE CONCEITUAL'
  contexto?: string
  desafio?: string
  ideia?: string
  experiencia?: string
  sistema?: string[] // tecnologias, canais, disciplinas
  impacto?: string // só quantitativo/qualitativo REAL
  media?: CaseMedia[]
}

export const CASES: CaseStudy[] = [
  {
    slug: 'aura-cafe',
    title: 'Lançamento conectado AURA Café',
    area: 'Presença · Commerce · Live & conectado',
    status: 'CASE CONCEITUAL',
    contexto:
      'Uma marca fictícia de cafés especiais entrando num mercado saturado: produto excepcional, história forte — e nenhuma presença construída.',
    desafio:
      'Lançar a marca já parecendo do tamanho da própria ambição, e transformar a inauguração em algo que as pessoas vivessem — não apenas vissem num post.',
    ideia:
      'O café como experiência sensorial completa: uma marca que se percebe antes mesmo de se provar.',
    experiencia:
      'Identidade e site imersivo com o blend visualizado em 3D no navegador; pré-venda conduzida por uma jornada no WhatsApp; e, na inauguração, um totem interativo com realidade aumentada revelando a origem de cada grão, com degustação gamificada conectando o espaço físico ao digital.',
    sistema: [
      'Branding',
      'Site WebGL',
      'E-commerce',
      'CRM · WhatsApp',
      'Totem interativo',
      'Realidade aumentada',
      'Conteúdo de lançamento',
    ],
    media: [],
  },
  {
    slug: 'proximo-case-digital',
    title: 'Próximo case — Experiência digital',
    area: 'Experiência digital',
    status: 'EM BREVE',
  },
  {
    slug: 'proximo-case-live',
    title: 'Próximo case — Live & conectado',
    area: 'Experiência live e conectada',
    status: 'EM BREVE',
  },
]
