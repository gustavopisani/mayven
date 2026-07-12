import type { ReportData } from '../types'

/**
 * STATUS REPORT — GALPÃO ANIMAL · JUNHO 2026
 * Todo o conteúdo do report vive aqui. Para criar um novo mês,
 * duplique este arquivo, ajuste slug/label/código e registre em src/data/clients.ts.
 */
export const galpaoAnimalJunho2026Report: ReportData = {
  clientSlug: 'galpao-animal',
  clientName: 'Galpão Animal',
  reportSlug: 'junho-2026',
  monthLabel: 'Junho 2026',
  // >>> Código de acesso deste report (MVP, não é segurança real) <<<
  accessCode: 'MAYVEN2026',
  type: 'status-report',
  hero: {
    eyebrow: 'Monthly Channel Ops',
    title: 'Status Report',
    subtitle: 'Avanço, performance e aprendizados do mês anterior.',
    period: 'Junho 2026',
  },
  executiveSummary: {
    highlight: 'Junho foi um mês de retomada, organização e leitura de comportamento da audiência.',
    kpis: [
      { label: 'Conteúdos publicados', value: '38', description: 'posts, reels e stories' },
      { label: 'Alcance total', value: '48,2k', description: 'pessoas impactadas' },
      { label: 'Interações', value: '3.860', description: 'curtidas, comentários, salvamentos' },
      { label: 'Crescimento', value: '+312', description: 'novos seguidores' },
      { label: 'Mensagens', value: '147', description: 'directs recebidos' },
      { label: 'Top formato', value: 'Reels', description: 'educativos e bastidores' },
    ],
    mayvenReading: 'O conteúdo deixa de ser apenas publicação e passa a operar como sistema de sinal.',
  },
  execution: {
    objectives: [
      {
        objective: 'Retomar frequência nas redes',
        status: 'Concluído',
        observation: 'Publicações distribuídas durante o mês.',
      },
      {
        objective: 'Criar linha editorial mais clara',
        status: 'Concluído',
        observation: 'Educação, vitrine, bastidor, comunidade e conversão.',
      },
      {
        objective: 'Aumentar presença em vídeo',
        status: 'Em evolução',
        observation: 'Reels performaram melhor que artes estáticas.',
      },
    ],
  },
  deliverables: [
    { label: 'Posts / Carrosséis', value: '12', description: 'entregas do mês' },
    { label: 'Reels', value: '14', description: 'entregas do mês' },
    { label: 'Stories', value: '96', description: 'entregas do mês' },
    { label: 'Roteiros de vídeo', value: '14', description: 'entregas do mês' },
  ],
  performance: {
    kpis: [
      { label: 'Alcance', value: '48,2k', description: '+18% vs. mês anterior' },
      { label: 'Engajamento', value: '8,0%', description: 'sinal de conteúdo útil' },
      { label: 'Salvamentos', value: '642', description: 'conteúdo educativo' },
    ],
    bars: [
      { label: 'Alcance orgânico', value: 78 },
      { label: 'Interações totais', value: 64 },
      { label: 'Mensagens comerciais', value: 52 },
    ],
    worked: 'Reels educativos, bastidores da loja e conteúdos que respondem dúvidas reais do público.',
    attention: 'Os canais precisam de papel editorial mais claro para evitar mistura entre exóticos, aquáticos e loja.',
  },
  channels: [
    {
      channel: 'Instagram principal',
      role: 'Marca, autoridade e relacionamento',
      reading: 'Melhor canal para comunidade.',
    },
    {
      channel: 'Instagram aquáticos',
      role: 'Nicho específico e produtos aquáticos',
      reading: 'Precisa de editoria mais limpa.',
    },
    {
      channel: 'Instagram exóticos',
      role: 'Desejo, educação e descoberta',
      reading: 'Alto potencial de engajamento.',
    },
    {
      channel: 'Google Perfil',
      role: 'Busca local e reputação',
      reading: 'Atualizações recorrentes são necessárias.',
    },
    {
      channel: 'Site',
      role: 'Vitrine central e destino dos CTAs',
      reading: 'Deve centralizar a percepção da marca.',
    },
  ],
  topContent: [
    {
      title: 'Cuidados básicos com répteis',
      format: 'Reel',
      result: 'Maior alcance',
      reading: 'Educação gera retenção.',
    },
    {
      title: 'Bastidores da loja',
      format: 'Stories',
      result: 'Mais respostas',
      reading: 'Rotina real aproxima.',
    },
    {
      title: 'Animal da semana',
      format: 'Carrossel',
      result: 'Mais salvamentos',
      reading: 'Descoberta tem valor.',
    },
  ],
  learnings: [
    { title: 'Vídeo como motor', description: 'Reels performam melhor que artes estáticas.' },
    {
      title: 'Educação vende confiança',
      description: 'Cuidados, manejo e habitat geram salvamentos e autoridade antes da conversão.',
    },
    {
      title: 'Bastidor aproxima',
      description: 'Rotina real da loja cria familiaridade e reduz distância entre marca e audiência.',
    },
    {
      title: 'Direct como sinal comercial',
      description: 'Perguntas de disponibilidade indicam oportunidade de CTA, WhatsApp e site mais integrados.',
    },
  ],
  opportunities: [
    { title: 'Organizar perfis', description: 'Definir papel claro para cada canal.' },
    { title: 'Transformar dúvidas em séries', description: 'Criar quadro recorrente de perguntas.' },
    { title: 'Fortalecer autoridade', description: 'Mais manejo, habitat e alimentação.' },
    { title: 'Ativar site como vitrine', description: 'Direcionar tráfego dos canais.' },
  ],
  recommendations: [
    'Aumentar presença de Reels educativos.',
    'Criar séries fixas para gerar recorrência.',
    'Separar melhor os papéis de cada canal.',
    'Integrar conteúdo com WhatsApp, site e Google Perfil.',
    'Usar perguntas reais como combustível editorial.',
    'Criar rituais de aprovação mais simples.',
  ],
  dependencies: [
    { need: 'Fotos e vídeos da loja', owner: 'Cliente', observation: 'Base para Reels e Stories.' },
    {
      need: 'Produtos e animais disponíveis',
      owner: 'Cliente',
      observation: 'Evita comunicação desatualizada.',
    },
    {
      need: 'Aprovação do calendário',
      owner: 'Cliente + Mayven',
      observation: 'Ritual mensal simples.',
    },
  ],
  closing: {
    quote:
      'Não se trata apenas de postar. Trata-se de criar uma presença digital consistente, mensurável e conectada ao crescimento da marca.',
    perceivedDelivery: 'O cliente vê o que foi feito, quais sinais surgiram e como isso vira ação.',
    nextStep: {
      label: 'Ver Plano de Execução',
      href: '/client/galpao-animal/plan/julho-2026',
    },
  },
}
