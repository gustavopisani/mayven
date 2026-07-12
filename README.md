# MAYVEN — Creative Tech Media Company

Site single-page da MAYVEN. Conceito: **The System Behind the Signal** — a própria experiência do site
é a demonstração da capacidade técnica e criativa da empresa. Tudo é computado em tempo real no browser:
nenhum vídeo decorativo, nenhum efeito sem função narrativa.

Três áreas:

- **Home** — `/` (experiência pública)
- **Propostas comerciais** — `/propostas/<cliente>` (privadas, gate por código)
- **Área do cliente / Reports** — `/client/...` (privada, gate por código)

## Instalação e desenvolvimento

```bash
npm install
npm run dev        # http://localhost:5173
```

Rotas úteis em dev:

- Home: `/`
- Proposta Galpão Animal: `/propostas/galpaoanimal`
- Report Galpão Animal · Junho 2026: `/client/galpao-animal/report/junho-2026`
- Plano Galpão Animal · Julho 2026: `/client/galpao-animal/plan/julho-2026`

## Build e deploy

```bash
npm run build                      # gera dist/
npm run preview                    # testa o build localmente
npx tsc --noEmit                   # typecheck
firebase deploy --only hosting     # publica (projeto mayven-ff490, SPA rewrite configurado)
```

## Estrutura

```
src/
  main.tsx            roteamento por pathname: / · /client (lazy) · /propostas/* (lazy)
  App.tsx             home: ordem das seções, temas por seção (body[data-theme]), Lenis, loader
  styles.css          design system completo (tokens no :root)
  components/         1 seção = 1 componente (Loader, Nav, Hero, Manifesto, InvisibleWork,
                      Services, SignalSystem, Work, Operation, Editorial, Studio, FooterCta)
  three/              cenas WebGL lazy (HeroScene = Signal Rupture · InvisibleProcessor = vídeo→shader)
  lib/bus.ts          input bus mutável (mouse/scroll/velocidade) + quality tiers (high/med/low)
  lib/ui.tsx          Magnetic, scrollToId, hooks de mobile/reduced-motion
  client/ proposal/   páginas independentes (não tocar ao mexer na home)
assets/               originais de mídia (masters, logo fonte) — NUNCA entram no build
public/               só o que o site serve: brand/, vídeo-textura 720p, robots, sitemap
```

## Arquitetura WebGL

- **Dois canvases lazy, nunca simultâneos** (decisão documentada em `REBUILD_AUDIT.md` §6):
  `HeroScene` (superfície que se rompe: shader de displacement + partículas + camadas de parallax) e
  `InvisibleProcessor` (vídeo oculto como `VideoTexture` processado por 1 über-shader com 6 modos + crossfade data-mosh).
- Three.js compartilha 1 chunk (~800 KB) carregado uma única vez, apenas em desktops com GPU real
  (renderers de software caem no fallback procedural CSS).
- `frameloop='never'` fora da viewport; DPR limitado por tier; cleanup completo de geometria/material/textura.
- Input flui pelo bus mutável (`window.__mayven`) — zero re-render de React no hot path.

## Tiers de qualidade (`src/lib/bus.ts`)

`quality()` → `high` (desktop ≥1200px) · `med` (tablet/desktop fraco) · `low` (≤860px ou reduced-motion:
**zero WebGL**, stacks editoriais estáticos). Ajuste orçamentos em `DPR_CAP` e `PARTICLE_BUDGET`.

## Manutenção das animações

- Pins e temas estão acoplados: os multiplicadores em `THEMES` (App.tsx) devem espelhar o `end` de cada pin.
- Invisible Work: camadas em `LAYERS` (copy/accents) e efeitos em `InvisibleProcessor.tsx` (`fxNome()` no shader).
- `prefers-reduced-motion` desativa Lenis, pins, marquees e grain — toda informação permanece acessível.

## Otimização de assets

- Vídeos: sempre H.264 CRF≥24, `faststart`, sem áudio; masters em `assets/video/masters/`.
- Logo: usar SEMPRE `/brand/mayven-mark.png` (arquivo oficial) — nunca redesenhar o símbolo.
- GIFs de preview de clientes: converter para MP4 (o hub do cliente usa `<video muted loop>`).

## Pendências reais (não inventar conteúdo)

- Cases reais em Selected Signals (estrutura pronta; frameworks marcados como "em construção").
- Links sociais reais no footer/menu (placeholders apontam para as homes das plataformas).
- OG image dedicada (hoje usa o logo).
- E-mail definitivo (placeholder: hello@mayven.com.br).
