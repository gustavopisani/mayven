import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'
import ContactForm from './ContactForm'
import { useHeroVariant, usePrefersReducedMotion } from './hooks'
import { xstore } from './store'

gsap.registerPlugin(ScrollTrigger)

/* =====================================================================
   05 — COMEÇAR: o finale do site (princípio do footer do landonorris.com,
   identidade 100% Mayven). Fundo externo magenta de alto contraste; um
   grande painel charcoal com cantos arredondados, aba central no topo e
   recorte na base sobe e assenta; headline centralizada entra linha a
   linha por máscaras; o formulário (comportamento preservado) sobe da
   base e assume o centro; links com faixa magenta no hover; marquee de
   capacidades reage à direção do scroll; rodapé legal integrado.
   Sem pin, sem câmera, sem objetos 3D — o canvas fica mudo aqui.
   ===================================================================== */

const CAPS = ['STRATEGY', 'BRAND', 'DIGITAL', 'WEBGL', 'CONTENT', 'MEDIA', 'AI', 'IOT', 'SPATIAL', 'LIVE']
const EXPLORE = [
  { t: 'O que fazemos', href: '#c-presenca' },
  { t: 'Experiências', href: '#c-experiencias' },
  { t: 'Método', href: '#c-metodo' },
  { t: 'Cases', href: '#c-cases' },
]
const CONNECT = [
  { t: 'Instagram', href: 'https://instagram.com', ext: true },
  { t: 'LinkedIn', href: 'https://linkedin.com', ext: true },
  { t: 'Área do Cliente', href: '/client' },
  { t: 'E-mail', href: 'mailto:hello@mayven.com.br' },
]

export default function ContactFinale() {
  const secRef = useRef<HTMLElement>(null)
  const variant = useHeroVariant()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const mobile = variant === 'mobile'
    let marqueeOn = false
    const ctx = gsap.context(() => {
      /* o painel sobe e assenta sobre o fundo magenta (sem profundidade 3D) */
      gsap.fromTo(
        '.fin-panel',
        { y: mobile ? 70 : 130, scale: mobile ? 1 : 0.985 },
        {
          y: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.fin-outer', start: 'top 92%', end: 'top 18%', scrub: 0.4 },
        },
      )
      /* headline linha a linha — máscaras com direções e atrasos distintos */
      const dirs = [
        { yPercent: 118, xPercent: 0 },
        { yPercent: 128, xPercent: -7 },
        { yPercent: 132, xPercent: 7 },
      ]
      dirs.forEach((from, i) => {
        gsap.fromTo(`.fin-h${i}`, from, {
          yPercent: 0,
          xPercent: 0,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.fin-head', start: `top ${88 - i * 4}%`, end: `top ${50 - i * 4}%`, scrub: 0.4 },
        })
      })
      gsap.fromTo(
        '.fin-copy',
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: '.fin-copy', start: 'top 94%', end: 'top 66%', scrub: 0.4 } },
      )
      /* o formulário sobe da parte inferior e assume o centro */
      gsap.fromTo(
        '.fin-formwrap',
        { opacity: 0, y: 90 },
        { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: '.fin-formwrap', start: 'top 97%', end: 'top 58%', scrub: 0.4 } },
      )
      gsap.fromTo(
        '.fin-links',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, scrollTrigger: { trigger: '.fin-links', start: 'top 98%', end: 'top 76%', scrub: 0.4 } },
      )
      /* âncora no marquee: o legal fica no fim absoluto da página e o próprio
         trigger nunca alcançaria o range com folga */
      gsap.fromTo(
        '.fin-legal',
        { opacity: 0 },
        { opacity: 1, scrollTrigger: { trigger: '.fin-marquee', start: 'top 98%', end: 'top 80%', scrub: 0.4 } },
      )
      /* marquee só anda com a seção em cena */
      ScrollTrigger.create({
        trigger: '.fin-outer',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => { marqueeOn = self.isActive },
      })
    }, secRef)

    /* marquee contínuo — responde suavemente à direção/velocidade do scroll */
    const track = secRef.current!.querySelector<HTMLElement>('.fin-marquee-track')
    let mx = 0
    const marquee = () => {
      if (!marqueeOn || !track || document.hidden) return
      const v = gsap.utils.clamp(-1.6, 1.6, xstore.vel * 0.02)
      mx -= 0.028 + v * 0.06
      if (mx <= -50) mx += 50
      if (mx > 0) mx -= 50
      track.style.transform = `translateX(${mx}%)`
    }
    gsap.ticker.add(marquee)

    /* o símbolo em grande escala responde de leve ao cursor (desktop) */
    let offMove: (() => void) | undefined
    if (!mobile && matchMedia('(pointer: fine)').matches) {
      const mark = secRef.current!.querySelector<HTMLElement>('.fin-mark')
      if (mark) {
        const qx = gsap.quickTo(mark, 'x', { duration: 0.8, ease: 'power3.out' })
        const qy = gsap.quickTo(mark, 'y', { duration: 0.8, ease: 'power3.out' })
        const mm = () => { qx(xstore.mx * -18); qy(xstore.my * -12) }
        window.addEventListener('mousemove', mm, { passive: true })
        offMove = () => window.removeEventListener('mousemove', mm)
      }
    }
    return () => {
      gsap.ticker.remove(marquee)
      offMove?.()
      ctx.revert()
    }
  }, [variant, reduced])

  /* âncoras internas passam pelo Lenis (mesmo comportamento da nav) */
  const go = (href: string) => (e: React.MouseEvent) => {
    if (!href.startsWith('#')) return
    e.preventDefault()
    const el = document.getElementById(href.slice(1))
    const lenis = (window as unknown as { __xlenis?: Lenis }).__xlenis
    if (el) lenis ? lenis.scrollTo(el) : el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={secRef}
      id="c-contato"
      className={`x-ch x-fin ${reduced ? '' : 'is-anim'}`}
      style={{ minHeight: '280vh' }}
      aria-label="Começar um projeto"
    >
      <div className="fin-outer">
        <p className="x-mono fin-eyebrow">05 — COMEÇAR</p>
        <div className="fin-panel">
          <img className="fin-mark" src="/brand/mayven-mark.png" alt="" aria-hidden="true" />
          <div className="fin-inner">
            <div className="fin-head">
              <h2 aria-label="O que sua marca precisa construir agora?">
                <span className="fin-mask" aria-hidden="true">
                  <span className="fin-line fin-h0">O que sua marca</span>
                </span>
                <span className="fin-mask" aria-hidden="true">
                  <span className="fin-line fin-h1">precisa</span>
                </span>
                <span className="fin-mask" aria-hidden="true">
                  <span className="fin-line fin-h2"><em>construir agora?</em></span>
                </span>
              </h2>
            </div>
            <div className="fin-copy">
              <p>
                Uma presença mais forte. Uma nova experiência digital. Uma jornada de compra diferente.
                Um lançamento, uma ativação, um espaço conectado — ou algo que ainda não tem um formato definido.
              </p>
              <p className="fin-punch">
                Conte a ambição. <strong>A gente ajuda a dar forma a ela.</strong>
              </p>
            </div>
            <div className="fin-formwrap">
              <ContactForm />
            </div>
            <nav className="fin-links" aria-label="Navegação e contato">
              <ul>
                {EXPLORE.map((l) => (
                  <li key={l.t}>
                    <a className="fin-link x-mono" href={l.href} onClick={go(l.href)} data-x="">
                      <span>{l.t}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <ul>
                {CONNECT.map((l) => (
                  <li key={l.t}>
                    <a
                      className="fin-link x-mono"
                      href={l.href}
                      {...(l.ext ? { target: '_blank', rel: 'noreferrer' } : {})}
                      data-x=""
                    >
                      <span>{l.t}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="fin-marquee" aria-hidden="true">
            <div className="fin-marquee-track">
              <span>{CAPS.join(' · ')} · </span>
              <span>{CAPS.join(' · ')} · </span>
            </div>
          </div>
          <footer className="fin-legal">
            <div className="fin-brand">
              <img src="/brand/mayven-mark.png" alt="" />
              <span>MAYVEN</span>
            </div>
            <p className="x-mono fin-tag">CREATIVE TECH MEDIA COMPANY</p>
            <a className="x-mono fin-mail" href="mailto:hello@mayven.com.br">HELLO@MAYVEN.COM.BR</a>
            <p className="x-mono fin-copyright">
              © 2026 MAYVEN — PRESENÇA PARA MARCAS QUE NÃO NASCERAM PARA PARECER COMUNS.
            </p>
          </footer>
        </div>
      </div>
    </section>
  )
}
