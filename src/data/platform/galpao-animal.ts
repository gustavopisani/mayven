import type { ClientPlatform } from './types'

/**
 * PLATAFORMA — GALPÃO ANIMAL
 * Configuração centralizada da área privada do cliente:
 * hub de módulos, atividade, próximo ciclo e conteúdo do Brand System.
 * Campos configuráveis (datas, ciclo, URL do site) vivem aqui.
 */
export const galpaoAnimalPlatform: ClientPlatform = {
  clientSlug: 'galpao-animal',
  // >>> Código de acesso da área do cliente (hub + brand system) <<<
  accessCode: 'MAYVEN2026',
  currentCycle: 'Julho 2026',
  operationStatus: 'Em andamento',
  lastUpdate: '10 · JUL · 2026',
  websiteUrl: 'https://galpaoanimal.web.app/',
  websitePreview: {
    gif: '/assets/clients/galpao-animal/website-preview.gif',
  },
  hero: {
    titleLine1: 'Sua operação digital,',
    titleLine2: 'conectada.',
    copy: 'Estratégia, experiência, conteúdo e performance operando como um único sistema.',
  },
  systemMap: {
    nodes: ['Brand System', 'Website Experience', 'Content Engine', 'Media Engine', 'Insights e Decisões'],
    returnLabel: 'Aprendizados retornam ao planejamento e posicionamento',
  },
  activeModules: [
    {
      id: 'brand-system',
      num: '01',
      name: 'Brand System',
      category: 'Estratégia e Marca',
      desc: 'Posicionamento, narrativa, identidade e voz.',
      complement:
        'A fundação estratégica que orienta como o Galpão Animal se apresenta, se comunica e constrói valor.',
      status: 'ATIVO · VERSÃO 1.0',
      context: ['Posicionamento', 'Narrativa central', 'Voz da marca', 'Territórios editoriais'],
      cta: { label: 'Abrir Sistema de Marca', href: '/client/galpao-animal/brand-system' },
      visual: 'brand',
    },
    {
      id: 'website-experience',
      num: '02',
      name: 'Website Experience',
      category: 'Experiência Digital',
      desc: 'Sites que parecem produto, não cartão de visita.',
      complement:
        'Uma experiência digital criada para transformar a presença da marca em percepção, descoberta e relacionamento.',
      status: 'ONLINE · PRODUÇÃO',
      context: ['Ambiente: Desenvolvimento', 'Status: Online', 'Experiência responsiva', 'Tecnologia Imersiva'],
      cta: { label: 'Abrir Experiência', href: 'https://galpaoanimal.web.app/', external: true },
      visual: 'website',
    },
    {
      id: 'content-engine',
      num: '03',
      name: 'Content Engine',
      category: 'Conteúdo e Autoridade',
      desc: 'Linha editorial, vídeos, posts, carrosséis e autoridade.',
      complement:
        'O sistema que transforma estratégia e dados em conteúdo recorrente para os canais da marca.',
      status: 'CICLO ATIVO · JULHO 2026',
      context: ['Planejamento editorial', 'Conteúdos programados', 'Esteira de produção', 'Direcionamento por dados'],
      cta: { label: 'Ver Plano de Execução', href: '/client/galpao-animal/plan/julho-2026' },
      visual: 'content',
    },
    {
      id: 'media-engine',
      num: '04',
      name: 'Media Engine',
      category: 'Performance e Distribuição',
      desc: 'Criativos, distribuição, testes e otimização.',
      complement:
        'A camada de acompanhamento que conecta performance, leitura dos canais e decisões para o próximo ciclo.',
      status: 'REPORT DISPONÍVEL · JUNHO 2026',
      context: ['Performance dos canais', 'Crescimento e alcance', 'Conteúdos de destaque', 'Aprendizados e recomendações'],
      cta: { label: 'Ver Status Report', href: '/client/galpao-animal/report/junho-2026' },
      visual: 'media',
    },
  ],
  expansion: {
    title: 'Expansão do Sistema',
    copy: 'Novas capacidades podem ser conectadas à operação conforme as necessidades da marca evoluem.',
    note: 'Este módulo não faz parte do plano atual.',
    modules: [
      {
        id: 'creative-technology',
        name: 'Creative Technology',
        desc: 'WebGL, 3D, motion, experiências interativas e novas interfaces digitais.',
        possibilities: [
          'Campanhas interativas',
          'Experiências WebGL',
          'Visualizadores',
          'Landing pages especiais',
          'Ativações digitais',
        ],
      },
      {
        id: 'ai-marketing-ops',
        name: 'AI Marketing Ops',
        desc: 'Workflows, agentes e produção assistida por inteligência artificial.',
        possibilities: [
          'Automação de fluxos',
          'Organização do banco editorial',
          'Assistência na produção',
          'Monitoramento',
          'Integração entre sistemas',
        ],
      },
    ],
  },
  activity: [
    {
      type: 'Plano publicado',
      date: '10 · JUL · 2026',
      module: 'Content Engine',
      href: '/client/galpao-animal/plan/julho-2026',
    },
    {
      type: 'Report disponibilizado',
      date: '08 · JUL · 2026',
      module: 'Media Engine',
      href: '/client/galpao-animal/report/junho-2026',
    },
    {
      type: 'Website em produção',
      date: '08 · JUL · 2026',
      module: 'Website Experience',
      href: 'https://galpaoanimal.web.app/',
    },
    {
      type: 'Brand System v1.0',
      date: '05 · JUL · 2026',
      module: 'Brand System',
      href: '/client/galpao-animal/brand-system',
    },
  ],
  nextCycle: {
    period: 'Agosto 2026',
    items: [
      'Próxima leitura de performance',
      'Revisão editorial',
      'Ajustes de conteúdo baseados nos resultados do ciclo atual',
    ],
    copy: 'Cada novo ciclo combina planejamento, execução, leitura de performance e otimização.',
  },
  brandSystem: {
    eyebrow: 'BRAND SYSTEM · GALPÃO ANIMAL',
    title: 'A fundação estratégica da marca.',
    intro:
      'Um sistema vivo de posicionamento, narrativa, voz e princípios que orienta todas as decisões de comunicação e experiência.',
    indicators: [
      { label: 'Status', value: 'Ativo' },
      { label: 'Versão', value: '1.0' },
      { label: 'Atualização', value: '05 · JUL · 2026' },
      { label: 'Responsável', value: 'Mayven + Galpão Animal' },
    ],
    sections: {
      northStar: {
        title: 'Uma marca que transforma paixão em cuidado responsável.',
        copy: 'O Galpão Animal deve ser percebido como uma referência capaz de unir paixão por animais, conhecimento especializado, orientação responsável e experiências memoráveis.',
      },
      positioning: {
        title: 'Posicionamento',
        copy: 'O Galpão Animal é a referência que conecta tutores e apaixonados por animais a uma relação mais consciente, segura e responsável com espécies exóticas, aquáticas e pets especiais.',
        pillars: ['Conhecimento especializado', 'Origem e responsabilidade', 'Suporte durante toda a jornada'],
      },
      narrative: {
        title: 'Narrativa',
        copy: 'Paixão exige conhecimento. Cuidar de uma espécie diferente começa pela informação certa, pela escolha responsável e pelo suporte adequado antes, durante e depois da compra.',
        flow: ['Descoberta', 'Conhecimento', 'Escolha', 'Cuidado', 'Comunidade'],
      },
      valueProposition: {
        title: 'Proposta de valor',
        copy: 'Curadoria, conhecimento e suporte especializado para quem deseja viver uma relação mais consciente e segura com animais especiais.',
        cards: ['Curadoria', 'Orientação', 'Estrutura', 'Confiança', 'Continuidade'],
      },
      principles: {
        title: 'Princípios da marca',
        items: [
          'O cuidado vem antes da venda.',
          'Informação também é parte do produto.',
          'Responsabilidade fortalece a paixão.',
          'Cada espécie exige uma jornada própria.',
          'O relacionamento continua depois da compra.',
        ],
      },
      audiences: {
        title: 'Arquitetura de público',
        groups: [
          'Pessoas descobrindo o universo dos animais especiais.',
          'Tutores buscando orientação e segurança.',
          'Entusiastas e criadores experientes.',
          'Aquaristas e comunidades especializadas.',
        ],
      },
      voice: {
        title: 'Como a marca fala',
        axes: [
          'Especialista, sem ser inacessível.',
          'Entusiasmada, sem ser irresponsável.',
          'Segura, sem ser arrogante.',
          'Comercial, sem pressionar.',
          'Educativa, sem parecer uma aula.',
          'Próxima, sem perder autoridade.',
        ],
        microcopy: [
          {
            avoid: 'Compre agora.',
            prefer: 'Descubra se essa espécie combina com sua rotina.',
          },
          {
            avoid: 'Animal fácil de cuidar.',
            prefer: 'Entenda os cuidados, a estrutura e a dedicação que essa espécie exige.',
          },
        ],
      },
      territories: {
        title: 'Territórios editoriais',
        items: [
          'Espécies e comportamento',
          'Cuidados e bem-estar',
          'Habitat e estrutura',
          'Alimentação',
          'Responsabilidade e documentação',
          'Bastidores e especialistas',
          'Histórias da comunidade',
          'Produtos como solução',
        ],
      },
      application: {
        title: 'Aplicação do sistema',
        copy: 'O Brand System orienta cada camada da operação — do site ao atendimento, do conteúdo às campanhas.',
        targets: [
          'Website Experience',
          'Content Engine',
          'Media Engine',
          'Campanhas',
          'Atendimento',
          'Experiência em loja',
          'Materiais comerciais',
        ],
      },
      evolution: {
        title: 'Um sistema vivo.',
        copy: 'O Brand System evolui conforme a marca aprende com seu público, seus canais e sua própria operação. Novos dados não substituem a estratégia: eles tornam a estratégia mais precisa.',
        versions: [
          { version: '1.0', date: '05 · JUL · 2026', note: 'Fundação estratégica publicada: posicionamento, narrativa, voz e territórios.' },
        ],
      },
    },
  },
}
