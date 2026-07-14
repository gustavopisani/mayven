/* Cases editoriais — fonte de dados única.
   REGRA: nunca inventar clientes, métricas ou resultados. Campos vazios ficam
   vazios; o componente esconde o que não existe. Preencha com conteúdo real. */

export type CaseMedia = { src: string; alt: string; kind: 'image' | 'video' }

export type CaseStudy = {
  slug: string
  title: string
  client?: string
  area: string // ex.: 'Experiência digital · Plataforma'
  status: 'EM OPERAÇÃO' | 'EM ANDAMENTO' | 'EM BREVE'
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
    slug: 'galpao-animal',
    title: 'Plataforma digital Galpão Animal',
    client: 'Galpão Animal',
    area: 'Presença · Experiência digital · Operação',
    status: 'EM ANDAMENTO',
    contexto:
      'Uma loja de animais exóticos de alto padrão com entrega muito acima da percepção que a presença digital comunicava.',
    desafio:
      'Construir uma presença à altura do negócio: site, identidade digital, conteúdo e uma operação contínua de acompanhamento.',
    ideia: 'Tratar a marca como um ecossistema — não como peças soltas de marketing.',
    experiencia:
      'Site imersivo, área de cliente com reports mensais e planos de execução, e um sistema de acompanhamento contínuo entre marca e operação.',
    sistema: ['Site imersivo', 'Área do cliente', 'Reports digitais', 'Planos de execução', 'Conteúdo'],
    // impacto: preencher com dados reais quando o ciclo de medição fechar
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
