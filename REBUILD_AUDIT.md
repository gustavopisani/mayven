# REBUILD_AUDIT — MAYVEN · The System Behind the Signal

Data: 08/07/2026 · Autor: revisão técnica pré-remodelação

## 1. Stack identificada

- **Vite 5 + React 18 + TypeScript 5** (SPA, sem router — roteamento mínimo por pathname em `src/main.tsx`)
- **GSAP 3 + ScrollTrigger** (pinning, scrub, timelines) · **Lenis** (smooth scroll, integrado ao ticker do GSAP)
- **Three.js 0.169 + @react-three/fiber 8** (React 18 — R3F 9 exigiria React 19; não migrar)
- Fontes self-hosted via @fontsource: Anton (display), Archivo (texto), JetBrains Mono (técnico)
- **Firebase Hosting** (`mayven-ff490`), `dist/` como public, rewrite SPA, headers de cache + noindex em `/propostas/**` e `/client/**`
- Sem git no diretório — **toda mudança é irreversível**; mudanças destrutivas exigem backup prévio (originais de mídia preservados em `assets/`)

## 2. Estrutura atual

- `src/App.tsx` — home: temas por seção (`body[data-theme]`), Lenis, bus de velocidade
- `src/components/*` — 1 seção por componente; `src/three/*` — cenas WebGL lazy; `src/lib/*` — bus de input + utilitários UI
- `src/client/*` e `src/proposal/*` — páginas independentes lazy (NÃO fazem parte da home; preservar intactas)
- `public/brand/*` — logo oficial (PNG); `public/assets/videos/mayven-signal-source.mp4` — fonte de textura da Invisible Work

## 3. Problemas encontrados

| # | Problema | Ação |
|---|---|---|
| 1 | `public/assets/clients/galpao-animal/website-preview.gif` com **185 MB** — entraria no deploy | Converter para MP4 (~2 MB), trocar `<img>` por `<video muted loop autoplay playsinline>` no ClientHub, mover GIF original para `assets/` (fora do build) |
| 2 | Copy com mistura PT/EN em textos explicativos (sub do hero em EN) | Títulos conceituais permanecem EN (linguagem da marca); textos explicativos → PT |
| 3 | Sem loader — primeiro paint mostra hero sem cerimônia e sem gate de fontes | Loader real (fonts.ready + chunk do hero, timeout 2.5s, mín. 700ms) |
| 4 | Nav sem menu, sem progresso de página, sem Área do Cliente | Menu fullscreen acessível (Esc, focus restore, scroll lock) + barra de progresso + link /client |
| 5 | Sem SEO estruturado (OG/canonical/sitemap/JSON-LD) | Meta completa em index.html + robots.txt + sitemap.xml |
| 6 | Sem quality tiers — partículas/DPR fixos | `quality()` no bus (high/med/low por largura/DPR/deviceMemory) consumido pelas cenas |
| 7 | Invisible Work com 7 itens; novo escopo pede 6 (Systems substitui Engineering; Performance sai como item e vira o resolve final) | Reduzir a 6, novo copy |
| 8 | What We Build descreve o escopo antigo (agência) — não cobre e-commerce, plataformas, CRM/WhatsApp, apps | Reescrever conteúdo dos 6 módulos preservando o sistema de interação (aprovado) |
| 9 | Falta a seção “Do lançamento à operação contínua” | Nova seção `Operation.tsx` |
| 10 | Ordem narrativa: What We Build vinha antes de Invisible Work | Reordenar: Manifesto → Invisible Work → What We Build → Method |

## 4. Componentes mantidos (aprovados em revisões anteriores — não redesenhar)

Hero (Signal Rupture, WebGL), Manifesto (white impact), Services (sistema de cards conectados — só conteúdo muda), SignalSystem (Signal OS — só ganha o feedback Learn→Decode), Work (framework honesto de cases), Editorial (media engine — cumpre a seção Culture/Experiments/Signals), Studio (command room), FooterCta (gravity field), Cursor, Grain.

## 5. Refatorados / novos / removidos

- **Refatorados:** Nav (menu+progresso+client area), InvisibleWork (6 itens), Services (conteúdo), App (ordem+temas+loader), Hero (copy PT + gate do loader), FooterCta (client area + kicker)
- **Novos:** `Loader.tsx`, `Operation.tsx`, `robots.txt`, `sitemap.xml`, `README.md`
- **Removidos:** nada estrutural; GIF 185MB sai do build

## 6. Arquitetura WebGL — decisão registrada

O master prompt prefere **um canvas persistente**. Decisão: **manter dois canvases lazy e não-simultâneos** (HeroScene e InvisibleProcessor). Justificativa: (a) nunca coexistem em viewport — cada um pausa o frameloop fora da tela (`frameloop='never'`); (b) compartilham o chunk do Three (804 KB carregado 1×); (c) unificá-los exigiria reescrever duas cenas aprovadas com risco real e ganho de GPU nulo (só 1 renderiza por vez); (d) o requisito de fundo (“sem múltiplos canvases desnecessários”) é atendido — são 2, justificados, pausados e com cleanup completo. Premissa adotada e documentada.

## 7. Mapa de seções (nova ordem)

Loader → Hero (#hero, void) → Manifesto (#manifesto, bone) → The Invisible Work (#tech, system, pin 6.6×) → What We Build (#build, void) → Method/Signal OS (#system, os, pin 4.2×) → Selected Signals (#work, void) → Operation (#operation, void) → Media Engine (#media, bone) → Studio (#studio, void) → Final CTA (#contact, void)

## 8. Mapa de interações

Cursor custom (pointer:fine) · botões magnéticos · pills hover/click (Invisible Work) · pilares com painel de inspeção (Media) · tilt+fx por card (What We Build) · scrub pins (hero/manifesto/tech/method) · temas por seção · menu fullscreen com teclado.

## 9. Riscos técnicos

1. Sem git — mudanças irreversíveis (mitigado: originais em `assets/`, edits cirúrgicos).
2. VideoTexture no Safari — testar autoplay muted (pendência de QA manual).
3. Pin ranges acoplados aos temas (`THEMES` documenta os multiplicadores — atualizar juntos).
4. Preview harness não captura screenshots com painel oculto — validação visual final é manual.

## 10. Estratégia de performance

Chunks lazy (Three 1×), frameloop pausado offscreen, DPR cap por tier (high 1.75 / med 1.4 / low 1.0), partículas por tier, vídeo-textura 720p/1.2MB, fontes woff2 self-hosted, imagens/mídia fora do bundle crítico, dist ~3 MB. Tiers: high (desktop dpr≤2, ≥1100px), med (tablet/desktop fraco), low (≤860px → sem canvas, fallbacks estáticos).

## 11. Estratégia mobile

≤860px: zero WebGL/canvas, hero procedural CSS, Invisible Work/Method/Work/Operation em stacks editoriais, hover→conteúdo sempre visível, sem pins, sem overflow horizontal.

## 12. Plano de implementação

Fase 2 Foundation (loader, nav, SEO, tiers) → Fase 3 Hero (copy/gate) → Fase 4 Core (IW 6 itens, WWB conteúdo, Method loop) → Fase 5 Business (Operation, footer/client area, cases pendências) → Fase 6 Responsivo/perf → Fase 7 QA (tsc, build, sondas no preview, mobile). Conteúdo pendente registrado na seção 16 do relatório final (cases reais, redes sociais, OG image dedicada).
