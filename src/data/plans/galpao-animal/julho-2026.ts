import type { PlanData } from '../../reports/types'

/**
 * PLANO DE EXECUÇÃO — GALPÃO ANIMAL · JULHO 2026
 * Construído a partir do Status Report de Junho 2026.
 * Para criar um novo mês: duplique este arquivo, ajuste slug/label/código,
 * atualize `basedOnReport` para o report anterior e registre em src/data/clients.ts.
 */
export const galpaoAnimalJulho2026Plan: PlanData = {
  clientSlug: 'galpao-animal',
  clientName: 'Galpão Animal',
  planSlug: 'julho-2026',
  monthLabel: 'Julho 2026',
  type: 'execution-plan',
  // >>> Código de acesso deste plano (MVP, não é segurança real) <<<
  accessCode: 'MAYVEN2026',
  basedOnReport: {
    label: 'Status Report Junho 2026',
    href: '/client/galpao-animal/report/junho-2026',
    month: 'Junho 2026',
  },
  hero: {
    eyebrow: 'Monthly Execution Plan',
    title: 'Plano de Execução',
    subtitle: 'Decisões, conteúdo e operação para o próximo ciclo mensal.',
    summary:
      'Este plano foi construído a partir dos sinais de performance, comportamento da audiência e oportunidades identificadas no fechamento de Junho.',
  },
  strategicRationale: {
    title: 'Por que este plano existe',
    description:
      'O plano de Julho nasce dos sinais identificados no fechamento de Junho: maior resposta em vídeos educativos, engajamento em bastidores, dúvidas comerciais recorrentes e necessidade de organizar melhor os papéis editoriais dos canais.',
    signals: [
      {
        signal: 'Reels educativos tiveram melhor resposta',
        interpretation: 'Vídeo curto ajuda a transformar dúvida em atenção e confiança.',
        decision: 'Aumentar presença de Reels educativos no próximo mês.',
      },
      {
        signal: 'Bastidores geraram respostas e aproximação',
        interpretation: 'A audiência responde melhor quando percebe rotina real e proximidade.',
        decision: 'Criar uma linha recorrente de bastidores da loja.',
      },
      {
        signal: 'Dúvidas apareceram com força no direct',
        interpretation: 'Existe intenção comercial e necessidade de orientação antes da compra.',
        decision: 'Transformar perguntas frequentes em séries de conteúdo.',
      },
      {
        signal: 'Perfis com papéis editoriais misturados',
        interpretation: 'A separação de canais só funciona quando cada perfil tem função clara.',
        decision: 'Definir papéis por canal e organizar editorias.',
      },
    ],
  },
  objectives: [
    {
      title: 'Aumentar consistência de vídeo',
      description: 'Priorizar Reels educativos, bastidores e conteúdos de produto com CTA.',
    },
    {
      title: 'Transformar dúvidas em conteúdo',
      description: 'Criar séries a partir das perguntas reais recebidas no mês anterior.',
    },
    {
      title: 'Fortalecer autoridade',
      description: 'Produzir conteúdos sobre manejo, habitat, alimentação e responsabilidade.',
    },
    {
      title: 'Organizar papéis editoriais',
      description: 'Separar melhor institucional, exóticos, aquáticos, produto e comunidade.',
    },
    {
      title: 'Conectar conteúdo com conversão',
      description: 'Direcionar audiência para site, WhatsApp e canais de atendimento.',
    },
  ],
  editorialBank: {
    title: 'Banco Editorial',
    description: 'Temas e frentes de conteúdo que guiarão a produção do mês.',
    pillars: [
      {
        name: 'Educação e manejo',
        purpose: 'Gerar confiança e autoridade.',
        examples: [
          'Cuidados básicos',
          'Habitat ideal',
          'Alimentação',
          'Erros comuns',
          'Responsabilidade antes da compra',
        ],
      },
      {
        name: 'Bastidores da operação',
        purpose: 'Aproximar marca e audiência.',
        examples: ['Rotina da loja', 'Preparação dos ambientes', 'Atendimento', 'Chegadas', 'Equipe em ação'],
      },
      {
        name: 'Vitrine e disponibilidade',
        purpose: 'Apoiar conversão e intenção comercial.',
        examples: [
          'Animal da semana',
          'Produto em destaque',
          'Kit recomendado',
          'Chegou no Primal',
          'Disponibilidade com CTA',
        ],
      },
      {
        name: 'Autoridade e confiança',
        purpose: 'Reforçar responsabilidade, conhecimento e curadoria.',
        examples: [
          'Documentação',
          'Segurança',
          'Orientação para novos tutores',
          'Curadoria de espécies',
          'Mitos e verdades',
        ],
      },
      {
        name: 'Comunidade e relacionamento',
        purpose: 'Gerar participação e coletar sinais da audiência.',
        examples: ['Enquetes', 'Perguntas', 'Respostas rápidas', 'Conteúdo colaborativo', 'Reposts'],
      },
    ],
  },
  programmaticContent: {
    title: 'Conteúdo Programático',
    description:
      'Séries fixas para criar recorrência, facilitar produção e melhorar leitura de performance.',
    series: [
      {
        name: 'Pergunte ao Galpão',
        format: 'Reel / Stories',
        rationale: 'Usa dúvidas reais como combustível editorial.',
        frequency: 'Semanal',
      },
      {
        name: 'Animal da Semana',
        format: 'Carrossel / Reel',
        rationale: 'Une descoberta, desejo e educação.',
        frequency: 'Semanal',
      },
      {
        name: 'Guia Rápido de Manejo',
        format: 'Reel educativo',
        rationale: 'Conteúdo útil tende a gerar salvamentos e autoridade.',
        frequency: 'Semanal',
      },
      {
        name: 'Bastidores da Loja',
        format: 'Stories / Reels curtos',
        rationale: 'Rotina real cria proximidade e reduz distância com a marca.',
        frequency: 'Recorrente',
      },
      {
        name: 'Chegou no Galpão',
        format: 'Reel / Post produto',
        rationale: 'Transforma novidades em intenção comercial.',
        frequency: 'Conforme disponibilidade',
      },
    ],
  },
  channelPlan: [
    {
      channel: 'Instagram principal',
      role: 'Marca, comunidade, autoridade e relacionamento.',
      focus: 'Conteúdos institucionais, educativos e de bastidor.',
      expectedOutcome: 'Clareza de marca e aumento de conexão com a audiência.',
    },
    {
      channel: 'Instagram aquáticos',
      role: 'Nicho específico e especialização.',
      focus: 'Produtos, espécies, equipamentos e rotina aquática.',
      expectedOutcome: 'Separação editorial mais limpa e audiência mais qualificada.',
    },
    {
      channel: 'Instagram exóticos',
      role: 'Desejo, descoberta e educação.',
      focus: 'Espécies, manejo, curiosidades e orientação.',
      expectedOutcome: 'Mais engajamento e salvamentos em conteúdos educativos.',
    },
    {
      channel: 'Google Perfil',
      role: 'Busca local e reputação.',
      focus: 'Atualizações recorrentes, fotos, produtos e novidades.',
      expectedOutcome: 'Melhor presença em busca e apoio à decisão de visita.',
    },
    {
      channel: 'Site',
      role: 'Vitrine central e destino dos CTAs.',
      focus: 'Direcionamento dos conteúdos para páginas e WhatsApp.',
      expectedOutcome: 'Centralizar percepção e aumentar intenção comercial.',
    },
    {
      channel: 'WhatsApp',
      role: 'Conversão e atendimento.',
      focus: 'Receber tráfego qualificado dos conteúdos.',
      expectedOutcome: 'Transformar interesse em conversa comercial.',
    },
  ],
  productionVolume: [
    { label: 'Reels educativos', value: '8', description: 'Foco em manejo, dúvidas e orientação.' },
    { label: 'Reels de bastidores', value: '4', description: 'Rotina da loja e proximidade.' },
    { label: 'Carrosséis', value: '4', description: 'Conteúdo salvável e educativo.' },
    { label: 'Stories', value: '80+', description: 'Rotina, interação e disponibilidade.' },
    { label: 'Posts de produto', value: '6', description: 'Vitrine e intenção comercial.' },
    { label: 'Atualizações Google Perfil', value: '4', description: 'Busca local e reputação.' },
  ],
  calendar: [
    {
      week: 'Semana 1',
      focus: 'Organização editorial e educação',
      actions: ['Publicar conteúdo de manejo', 'Iniciar série Pergunta do Primal', 'Atualizar Google Perfil'],
      objective: 'Abrir o mês com clareza e autoridade.',
    },
    {
      week: 'Semana 2',
      focus: 'Bastidores e rotina da loja',
      actions: ['Reels de bastidores', 'Stories de rotina', 'Conteúdo de disponibilidade'],
      objective: 'Gerar proximidade e conversas.',
    },
    {
      week: 'Semana 3',
      focus: 'Vitrine e conversão',
      actions: ['Animal da semana', 'Produto em destaque', 'CTA para site e WhatsApp'],
      objective: 'Conectar interesse com ação comercial.',
    },
    {
      week: 'Semana 4',
      focus: 'Comunidade e aprendizado',
      actions: ['Enquetes', 'Perguntas e respostas', 'Coleta de dúvidas para próximo ciclo'],
      objective: 'Gerar sinais para o próximo Status Report.',
    },
  ],
  experiments: [
    {
      name: 'CTA para WhatsApp vs. CTA para site',
      hypothesis: 'Conteúdos com CTA claro tendem a gerar mais conversas comerciais.',
      metric: 'Cliques e mensagens.',
    },
    {
      name: 'Reels educativos curtos',
      hypothesis: 'Vídeos objetivos aumentam retenção e salvamentos.',
      metric: 'Retenção, alcance e salvamentos.',
    },
    {
      name: 'Bastidores com fala da equipe',
      hypothesis: 'Presença humana aumenta confiança.',
      metric: 'Respostas, compartilhamentos e directs.',
    },
  ],
  measurementPlan: {
    // interno — origem real dos dados; nunca aparece na interface do cliente
    dataSource: 'static-demo',
    badges: ['Fonte de dados · Metricool', 'Leitura Mayven · Performance & Conteúdo'],
    description:
      'Os indicadores de redes sociais são consolidados para orientar as decisões editoriais do próximo ciclo. A leitura combina performance por canal, comportamento da audiência, formatos com maior resposta e sinais de intenção comercial.',
    complement:
      'A partir desses dados, o plano editorial deixa de ser apenas uma lista de publicações e passa a operar como um sistema de decisão contínua.',
    metrics: [
      'Alcance',
      'Impressões',
      'Engajamento',
      'Salvamentos',
      'Compartilhamentos',
      'Cliques',
      'Mensagens',
      'Crescimento de seguidores',
      'Top formatos',
      'Top temas',
      'Performance por canal',
    ],
  },
  productionPipeline: [
    {
      step: 'Coleta de insumos',
      owner: 'Cliente',
      description: 'Fotos, vídeos, disponibilidade de produtos e informações sensíveis.',
    },
    {
      step: 'Curadoria editorial',
      owner: 'Mayven',
      description: 'Transformar dados, dúvidas e oportunidades em pautas.',
    },
    {
      step: 'Roteiro e direção',
      owner: 'Mayven',
      description: 'Definir narrativa, formato e objetivo de cada conteúdo.',
    },
    {
      step: 'Criação e edição',
      owner: 'Mayven',
      description: 'Produção visual, edição, legendas e criativos.',
    },
    {
      step: 'Aprovação',
      owner: 'Cliente + Mayven',
      description: 'Validação rápida para manter ritmo de publicação.',
    },
    {
      step: 'Publicação e monitoramento',
      owner: 'Mayven',
      description: 'Distribuição, acompanhamento e leitura de sinais.',
    },
  ],
  dependencies: [
    {
      need: 'Fotos e vídeos da loja',
      owner: 'Cliente',
      deadline: 'Semanal',
      impact: 'Base para Reels, Stories e bastidores.',
    },
    {
      need: 'Produtos e animais disponíveis',
      owner: 'Cliente',
      deadline: 'Toda segunda-feira',
      impact: 'Evita comunicação desatualizada.',
    },
    {
      need: 'Aprovação do calendário',
      owner: 'Cliente + Mayven',
      deadline: 'Início do mês',
      impact: 'Garante previsibilidade da operação.',
    },
    {
      need: 'Validação técnica sobre espécies',
      owner: 'Cliente',
      deadline: 'Antes da publicação',
      impact: 'Reduz risco de informação incorreta.',
    },
  ],
  closing: {
    title: 'Plano pronto para execução',
    description:
      'O próximo ciclo será guiado por dados, editorias claras, produção recorrente e leitura contínua de performance.',
    ctas: [
      { label: 'Ver Status Report anterior', href: '/client/galpao-animal/report/junho-2026' },
      { label: 'Solicitar ajuste no plano', href: '#' },
      { label: 'Aprovar plano', href: '#' },
    ],
  },
}
