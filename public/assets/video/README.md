# MAYVEN video assets

## Cases (seção 04 — CasesSection)

O case em destaque espera mídia em `public/assets/cases/`:

- `aura-cafe.mp4` — filme do case (loop, sem áudio, ~8–15s, 16:9 ou mais alto; é exibido em coluna de 54vw no desktop)
- `aura-cafe-cover.webp` — poster/fallback (mesmo enquadramento)

Enquanto não existirem, a seção mostra o placeholder editorial (nunca quebra).

## Tipos de Experiência (cards da seção 02)

A seção "Tipos de Experiência" espera um vídeo + poster por tipo, nestes nomes exatos:

- `type-digital.mp4` + `type-digital-poster.webp` — Experiências digitais
- `type-commerce.mp4` + `type-commerce-poster.webp` — Experiências de marca e comércio
- `type-live.mp4` + `type-live-poster.webp` — Experiências live e conectadas

Recomendação: mp4 H.264, ~6–10s em loop, sem áudio, ≤ 3 MB cada, 4:3 ou mais largo
(o card usa object-fit: cover — 4:3 no desktop, 16:9 no mobile). Enquanto os arquivos
não existirem, o card mostra um placeholder editorial (nunca quebra).

# MAYVEN hero film assets

These files are generated from `assets/video/Video-Project-12.mp4` and wired into the hero:

- `mayven-hero-desktop.webm`
- `mayven-hero-desktop.mp4`
- `mayven-hero-mobile.webm`
- `mayven-hero-mobile.mp4`
- `mayven-hero-poster-desktop.webp`
- `mayven-hero-poster-mobile.webp`

Replace them with the final approved A EXPERIÊNCIA É A INTERFACE films before launch if a newer edit is delivered.

Expected final composition:

- Desktop: cinematic 16:9, action centered/right, safe negative space left or center-left for HTML copy.
- Mobile: native 9:16 edit, not a crop of desktop, with safe headline and CTA space.

Current mobile files are temporary responsive derivatives cropped from `Video-Project-12.mp4` until the dedicated vertical edit is delivered.

Do not add external stock video URLs here. The hero is built to load only the selected desktop or mobile asset at runtime.
