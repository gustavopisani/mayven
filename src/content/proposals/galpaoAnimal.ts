/**
 * PROPOSTA COMERCIAL — GALPÃO ANIMAL × MAYVEN
 *
 * Todo o conteúdo editável da proposta vive neste arquivo:
 * textos, listas, CTAs e VALORES DE INVESTIMENTO.
 * Nenhum texto da página está hardcoded nos componentes.
 *
 * Estrutura narrativa:
 * Hero → Quem é a Mayven → O que fazemos → Cenário do cliente →
 * Leitura estratégica → Como podemos atuar → Metodologia →
 * Escopo recomendado → Investimento → Próximos passos
 */

/* ---------- Contatos / destinos dos CTAs (troque aqui) ---------- */
export const contacts = {
  email: 'hello@mayven.com.br',
  whatsapp: 'https://wa.me/5511962689674?text=Ol%C3%A1%2C%20Mayven!%20Vim%20pela%20proposta%20do%20Galp%C3%A3o%20Animal.',
  approveSubject: 'Aprovação — Proposta Galpão Animal × Mayven',
  meetingSubject: 'Alinhamento — Proposta Galpão Animal × Mayven',
}

export const meta = {
  client: 'Galpão Animal',
  pageTitle: 'Proposta Estratégica — Galpão Animal × Mayven',
  privateMark: 'PROPOSTA PRIVADA',
}

/* ---------- Gate de acesso (código fixo, client-side) ----------
 * O código NUNCA aparece em texto claro no bundle — só o hash SHA-256.
 * Para trocar o código, gere o novo hash no terminal:
 *   node -e "console.log(require('crypto').createHash('sha256').update('NOVO_CODIGO').digest('hex'))"
 * e cole o resultado em `expectedHash`.
 * Para resetar o acesso num navegador: DevTools > Application > Local Storage
 * e remova a chave abaixo (ou localStorage.removeItem no console). */
export const accessGate = {
  expectedHash: '1e87d3508a6d7d75c8341f997db7e409a1ea631a181a42169559335cc190772b',
  storageKey: 'mayven:proposal:galpaoanimal:access',
  eyebrow: 'PROPOSTA PRIVADA · GALPÃO ANIMAL',
  title: 'Acesso restrito à proposta estratégica.',
  description: 'Esta página contém uma proposta comercial desenvolvida pela Mayven para o Galpão Animal. Para continuar, insira o código de acesso enviado pela nossa equipe.',
  placeholder: 'Digite o código de acesso',
  button: 'Acessar proposta',
  error: 'Código inválido. Verifique o código recebido e tente novamente.',
  unsupported: 'Seu navegador não suporta a verificação segura do código. Atualize o navegador ou fale com a Mayven.',
  microcopy: 'Conteúdo privado · Mayven',
  lockLabel: 'Bloquear acesso novamente',
}

/* ---------- Navegação lateral ---------- */
export const navSections = [
  { id: 'mayven', num: '01', label: 'Mayven' },
  { id: 'o-que-fazemos', num: '02', label: 'O que fazemos' },
  { id: 'cenario', num: '03', label: 'Cenário' },
  { id: 'leitura', num: '04', label: 'Leitura' },
  { id: 'atuacao', num: '05', label: 'Atuação' },
  { id: 'metodologia', num: '06', label: 'Metodologia' },
  { id: 'escopo', num: '07', label: 'Escopo' },
  { id: 'investimento', num: '08', label: 'Investimento' },
  { id: 'proximos-passos', num: '09', label: 'Próximos passos' },
]

/* ---------- 01 · HERO ---------- */
export const hero = {
  eyebrow: 'PROPOSTA ESTRATÉGICA · GALPÃO ANIMAL',
  title: 'Uma presença digital à altura da maior referência em animais exóticos.',
  copy: 'O Galpão Animal já tem produto, história, repertório e uma comunidade apaixonada. A oportunidade agora é transformar essa força em uma presença digital mais clara, moderna, desejável e preparada para gerar autoridade, tráfego, relacionamento e venda.',
  ctaPrimary: 'Ver proposta',
  ctaSecondary: 'Falar com a Mayven',
  microcopy: 'Proposta privada · Desenvolvida por Mayven',
}

/* ---------- 02 · QUEM É A MAYVEN ---------- */
export const mayven = {
  eyebrow: '01 · QUEM É A MAYVEN',
  title: 'Mayven é uma Creative Tech Media Company.',
  copy: [
    'A Mayven combina estratégia, tecnologia, criação, mídia e inteligência artificial para construir presenças digitais mais fortes, experiências mais memoráveis e canais comerciais mais eficientes.',
    'Não atuamos como uma agência tradicional focada apenas em peças, posts ou sites isolados. Trabalhamos como uma camada estratégica e executiva para conectar marca, conteúdo, canais, tecnologia, vendas e dados.',
  ],
  punch: 'Criamos sistemas digitais para marcas que precisam parecer tão fortes online quanto são no mundo real.',
  keywords: ['Estratégia', 'Tecnologia', 'Criação', 'Mídia', 'IA', 'Vendas', 'Dados'],
}

/* ---------- 03 · O QUE FAZEMOS ---------- */
export const oQueFazemos = {
  eyebrow: '02 · O QUE FAZEMOS',
  title: 'O que construímos.',
  copy: 'A Mayven pode entrar por uma necessidade específica, como um site ou uma operação de conteúdo, mas nossa atuação pode evoluir para uma arquitetura completa de presença digital, vendas, tecnologia e crescimento.',
  cards: [
    {
      title: 'Sites e experiências digitais',
      desc: 'Sites institucionais, landing pages, páginas imersivas, interfaces comerciais, WebGL, motion e experiências interativas.',
    },
    {
      title: 'Conteúdo e canais',
      desc: 'Planejamento editorial, criação de posts, vídeos, roteiros, campanhas, gestão de redes e operação de presença digital.',
    },
    {
      title: 'E-commerce e vendas',
      desc: 'Implantação ou evolução de e-commerces, catálogos digitais, jornadas de compra, funis comerciais, CRM e WhatsApp Business.',
    },
    {
      title: 'Tecnologia e integrações',
      desc: 'Integrações entre sistemas, automações, dashboards, apps, ferramentas internas, inteligência artificial e fluxos operacionais.',
    },
    {
      title: 'Mídia e crescimento',
      desc: 'Campanhas, criativos, testes, performance, tráfego qualificado, análise de dados e otimização contínua.',
    },
    {
      title: 'Projetos especiais',
      desc: 'Eventos digitais, ativações interativas, experiências de marca, propostas online, simuladores, interfaces 3D e produtos digitais.',
    },
  ],
}

/* ---------- 04 · CENÁRIO DO CLIENTE ---------- */
export const cenario = {
  eyebrow: '03 · CENÁRIO DO CLIENTE',
  title: 'O Galpão Animal tem uma marca forte. O digital precisa comunicar essa força com mais clareza.',
  copy: [
    'A marca atua em um mercado altamente visual, emocional e educativo. Quem compra animais exóticos, equipamentos, alimentos ou acessórios não busca apenas produto. Busca confiança, orientação, procedência, cuidado e referência.',
    'Hoje existe uma oportunidade clara: organizar a presença digital da marca para que site, redes sociais, conteúdo, WhatsApp, experiência visual e canais comerciais trabalhem juntos.',
  ],
  cards: [
    {
      title: 'Marca com apelo natural',
      desc: 'O Galpão Animal possui um universo visual forte, produtos de alto interesse e uma comunidade naturalmente engajada.',
    },
    {
      title: 'Mercado educativo',
      desc: 'Animais exóticos exigem confiança, orientação, documentação, cuidado e conteúdo de qualidade.',
    },
    {
      title: 'Canais comerciais críticos',
      desc: 'O site, o Instagram e o WhatsApp precisam funcionar como partes conectadas da mesma jornada.',
    },
  ],
}

/* ---------- 05 · LEITURA ESTRATÉGICA ---------- */
export const leitura = {
  eyebrow: '04 · LEITURA ESTRATÉGICA',
  title: 'O que enxergamos.',
  copy: 'Antes de propor execução, a Mayven analisa onde a presença digital pode estar perdendo força, clareza ou conversão.',
  cards: [
    {
      title: 'Presença fragmentada',
      desc: 'Site, redes, conteúdo e canais comerciais ainda não parecem operar como um sistema único.',
      tag: 'Alta oportunidade',
    },
    {
      title: 'Autoridade subaproveitada',
      desc: 'O Galpão Animal tem repertório para educar o mercado, mas isso precisa virar conteúdo recorrente e organizado.',
      tag: 'Prioridade estratégica',
    },
    {
      title: 'Experiência digital abaixo do potencial da marca',
      desc: 'O universo de animais exóticos permite uma presença muito mais visual, imersiva e memorável.',
      tag: 'Alto impacto',
    },
    {
      title: 'Jornada comercial com oportunidade de melhoria',
      desc: 'Quem descobre a marca precisa de caminhos mais claros para catálogo, WhatsApp, atendimento, visita e compra.',
      tag: 'Potencial de conversão',
    },
    {
      title: 'WhatsApp como ponto crítico',
      desc: 'O canal precisa operar de forma segura, oficial e estruturada para reduzir riscos de bloqueio, perda de número ou limitação.',
      tag: 'Canal crítico',
    },
  ],
}

/* ---------- 06 · COMO A MAYVEN PODE ATUAR ---------- */
export const atuacao = {
  eyebrow: '05 · COMO A MAYVEN PODE ATUAR',
  title: 'Uma evolução em camadas.',
  copy: 'A proposta não é tratar site, redes sociais, WhatsApp, mídia e conteúdo como iniciativas separadas. O objetivo é construir um sistema digital em que cada camada fortalece a próxima.',
  layers: [
    {
      num: 'Camada 01',
      title: 'Estratégia e posicionamento',
      desc: 'Organizar narrativa, diferenciais, canais, prioridades e plano de execução.',
    },
    {
      num: 'Camada 02',
      title: 'Site e experiência digital',
      desc: 'Criar uma vitrine moderna, responsiva, visual e preparada para conversão.',
    },
    {
      num: 'Camada 03',
      title: 'Conteúdo e autoridade',
      desc: 'Transformar conhecimento sobre espécies, cuidados e produtos em presença recorrente.',
    },
    {
      num: 'Camada 04',
      title: 'Canais comerciais',
      desc: 'Estruturar WhatsApp Business, CTAs, catálogo, CRM e jornada de atendimento.',
    },
    {
      num: 'Camada 05',
      title: 'Mídia e crescimento',
      desc: 'Ampliar alcance, tráfego e geração de oportunidades.',
    },
    {
      num: 'Camada 06',
      title: 'Tecnologia e evolução',
      desc: 'Automatizar processos, integrar sistemas e criar novas experiências digitais conforme maturidade.',
    },
  ],
}

/* ---------- 07 · METODOLOGIA ---------- */
export const metodologia = {
  eyebrow: '06 · METODOLOGIA MAYVEN',
  title: 'Do diagnóstico à evolução contínua.',
  copy: 'A Mayven estrutura o trabalho em etapas conectadas para evitar ações soltas e garantir que estratégia, criação, tecnologia, mídia e dados operem na mesma direção.',
  steps: [
    { name: 'Decode', desc: 'Análise da marca, mercado, concorrência, público e presença atual.' },
    { name: 'Define', desc: 'Posicionamento, narrativa, proposta de valor e prioridades.' },
    { name: 'Design', desc: 'Direção visual, interface, experiência, conteúdo e identidade digital.' },
    { name: 'Engineer', desc: 'Desenvolvimento, motion, integrações, automações e experiências interativas.' },
    { name: 'Distribute', desc: 'Conteúdo, canais, mídia, campanhas e publicação.' },
    { name: 'Learn', desc: 'Dados, performance, aprendizado e otimização contínua.' },
  ],
}

/* ---------- 08 · ESCOPO RECOMENDADO ---------- */
export const escopo = {
  eyebrow: '07 · ESCOPO RECOMENDADO',
  title: 'Escopo recomendado para o Galpão Animal.',
  blocks: [
    {
      title: 'Projeto inicial',
      items: [
        'diagnóstico',
        'narrativa',
        'arquitetura do site',
        'design',
        'desenvolvimento',
        'publicação',
        'integração com WhatsApp',
      ],
    },
    {
      title: 'Operação mensal',
      items: [
        'planejamento editorial',
        'criação de conteúdo',
        'gestão de canais',
        'roteiros',
        'campanhas',
        'relatório',
      ],
    },
    {
      title: 'Diagnóstico WhatsApp Business',
      items: [
        'análise do número atual',
        'análise do Meta Business',
        'levantamento de riscos',
        'avaliação de integrações existentes',
        'recomendação de ferramenta oficial',
        'plano de regularização',
        'roadmap para implantação segura',
      ],
    },
    {
      title: 'Evoluções futuras',
      items: [
        'e-commerce',
        'catálogo',
        'CRM',
        'automações',
        'mídia paga',
        'experiências WebGL',
        'apps',
        'integrações',
        'IA aplicada ao atendimento e conteúdo',
      ],
    },
  ],
}

/* ---------- 09 · INVESTIMENTO ----------
 * >>> EDITE OS VALORES AQUI <<<
 * Basta trocar o campo `value` de cada bloco.
 * No bloco de WhatsApp: `thirdParty` é o texto de custos de terceiros
 * e `blockNote` é a observação sobre contratação da plataforma. */
export type InvestmentBlock = {
  num: string
  title: string
  subtitle: string
  desc: string
  includes: string[]
  value: string
  valueNote: string
  /** Chip de destaque no topo do card (ex.: "Recomendado") */
  tag?: string
  /** Frase curta de objetivo, exibida logo após a descrição */
  objective?: string
  /** O que o cliente recebe ao final */
  deliverable?: string
  /** O que NÃO está incluso nesta fase */
  notIncluded?: string[]
  /** Custos externos, separados do valor Mayven */
  thirdParty?: { label: string; desc: string }
  /** Observação específica do bloco, exibida abaixo do valor */
  blockNote?: string
}

export const investimento = {
  eyebrow: '08 · INVESTIMENTO',
  title: 'Investimento.',
  copy: 'A proposta pode ser estruturada em módulos, permitindo que o Galpão Animal avance por etapas: base estratégica e site, operação mensal de conteúdo e canais, estruturação segura do WhatsApp Business e evoluções especiais conforme prioridade.',
  blocks: [
    {
      num: '01',
      title: 'Projeto inicial',
      subtitle: 'Site e fundação estratégica',
      desc: 'Criação da base digital do Galpão Animal.',
      includes: ['diagnóstico', 'narrativa', 'arquitetura', 'design', 'desenvolvimento', 'publicação'],
      value: 'R$ 15.000,00',
      valueNote: 'projeto',
    },
    {
      num: '02',
      title: 'Operação mensal',
      subtitle: 'Conteúdo e Mídia',
      desc: 'Gestão contínua da presença digital.',
      includes: ['planejamento', 'criação', 'publicações', 'roteiros', 'direção criativa', 'relatórios'],
      value: 'R$ 1.200,00',
      valueNote: '/ mês',
    },
    {
      num: '03',
      title: 'Diagnóstico WhatsApp Business',
      subtitle: 'Mapeamento de risco e plano de regularização',
      tag: 'Recomendado',
      desc: 'Mapeamento técnico e estratégico do cenário atual do WhatsApp do Galpão Animal para entender riscos, limitações, histórico do número, estrutura Meta, integrações existentes e caminhos seguros de regularização.',
      objective: 'Avaliar a estrutura atual do WhatsApp do Galpão Animal e identificar o caminho mais seguro para regularização, integração e evolução do canal.',
      includes: [
        'levantamento da situação atual do número',
        'análise do uso atual do WhatsApp Business',
        'análise do Meta Business / Business Manager',
        'verificação de conta empresarial, ativos e permissões',
        'identificação de integrações, ferramentas ou APIs já utilizadas',
        'análise de riscos de bloqueio, limitação ou perda de número',
        'avaliação sobre manter número atual ou utilizar novo número',
        'mapeamento de necessidade de WABA — WhatsApp Business Account',
        'análise de requisitos para WhatsApp Business Platform',
        'recomendação de ferramentas oficiais, se necessário',
        'orientação sobre boas práticas de opt-in e templates',
        'desenho do cenário ideal para atendimento, vendas e futuras automações',
        'plano de ação para implantação segura em uma segunda etapa',
      ],
      deliverable:
        'Relatório diagnóstico com situação atual, riscos identificados, alternativas possíveis, recomendação de caminho, estimativa de custos de plataforma e próximos passos para implantação.',
      notIncluded: [
        'contratação de ferramenta',
        'migração de número',
        'configuração completa da API',
        'criação de chatbot',
        'automações',
        'integrações com CRM',
        'operação mensal do canal',
      ],
      value: 'R$ 2.500,00',
      valueNote: 'diagnóstico',
      blockNote:
        'Caso o Galpão Animal avance para a implantação após o diagnóstico, a Mayven poderá apresentar uma proposta específica para configuração, ferramenta, WABA, templates, integração com site, automações e treinamento.',
    },
    {
      num: '04',
      title: 'Evoluções especiais',
      subtitle: 'Creative Tech, e-commerce, integrações e implantação WhatsApp',
      desc: 'Ativações sob demanda para ampliar impacto, operação, venda e experiência.',
      includes: [
        'implantação WhatsApp Business após diagnóstico',
        'landing pages',
        'campanhas',
        'experiências interativas',
        'automações',
        'integrações',
        'e-commerce',
        'CRM',
        'apps',
        'mídia paga',
      ],
      value: 'Sob demanda',
      valueNote: '',
    },
  ] as InvestmentBlock[],
  /* Painel de apoio — diagnóstico antes de qualquer implantação (exibido após os cards) */
  support: {
    title: 'Um canal crítico precisa operar com segurança.',
    copy: 'Antes de implantar qualquer solução de WhatsApp, recomendamos diagnosticar o cenário atual. Como o canal já apresentou problemas no passado, a primeira etapa deve ser entender riscos, permissões, histórico do número e alternativas seguras antes de realizar qualquer migração ou integração.',
    punch: 'Primeiro entender o tamanho do problema. Depois, implantar com segurança — como próxima etapa, sob proposta específica.',
  },
  note: 'Os valores finais podem ser ajustados conforme escopo, prioridades e fases de implantação.',
}

/* ---------- 10 · PRÓXIMOS PASSOS ---------- */
export const proximosPassos = {
  eyebrow: '09 · PRÓXIMOS PASSOS',
  title: 'O Galpão Animal já tem produto, história e autoridade. Agora precisa de uma presença digital à altura.',
  copy: 'O próximo passo é validar o escopo inicial, ajustar prioridades e iniciar a construção da nova presença digital da marca.',
  cards: [
    { num: '1', title: 'Alinhamento final', desc: 'Validamos escopo, prioridades, prazos e materiais necessários.' },
    { num: '2', title: 'Aprovação da proposta', desc: 'Confirmamos o modelo de contratação e iniciamos o projeto.' },
    { num: '3', title: 'Kickoff', desc: 'Começamos a etapa de diagnóstico, planejamento e execução.' },
    { num: '4', title: 'Evolução contínua', desc: 'Acompanhamos performance, aprendizados e novos movimentos digitais.' },
  ],
  ctas: {
    approve: 'Aprovar proposta',
    meeting: 'Agendar alinhamento',
    talk: 'Falar com a Mayven',
  },
}

export const footer = {
  line: 'MAYVEN — CREATIVE TECH MEDIA COMPANY',
  legal: 'Proposta confidencial · Galpão Animal · Válida por 30 dias',
}
