import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useIsMobile, useReducedMotion } from '../lib/ui'

const SLAMS = ['Posts iguais.', 'Sites iguais.', 'Campanhas iguais.', 'Marcas esquecíveis.']

export default function Manifesto() {
  const secRef = useRef<HTMLElement>(null)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()
  const animate = !mobile && !reduced

  useEffect(() => {
    if (!animate) return
    const ctx = gsap.context(() => {
      secRef.current!.classList.add('is-pinned')
      const slams = gsap.utils.toArray<HTMLElement>('.mani-slam')
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: secRef.current,
          start: 'top top',
          end: '+=380%',
          pin: true,
          scrub: 0.5,
        },
      })
      slams.forEach((el) => {
        tl.fromTo(
          el,
          { opacity: 0, scale: 2.7, skewX: -10, filter: 'blur(10px)' },
          { opacity: 1, scale: 1, skewX: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
        )
        tl.to(el, { opacity: 0, y: -70, duration: 0.55, ease: 'power2.in' }, '+=0.35')
      })
      tl.fromTo(
        '.mani-break',
        { opacity: 0, scale: 0.6, rotate: -3 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.6)' },
      )
      tl.fromTo(
        '.mani-copy',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        '+=0.2',
      )
      tl.to({}, { duration: 0.8 }) // hold
    }, secRef)
    return () => {
      ctx.revert()
      secRef.current?.classList.remove('is-pinned')
    }
  }, [animate])

  return (
    <section ref={secRef} id="manifesto" className="manifesto">
      <div className="mani-stage">
        {SLAMS.map((s) => (
          <p className="mani-slam" key={s}>
            {s}
          </p>
        ))}
        <p className="mani-break">
          Mayven exists for <em>the opposite.</em>
        </p>
        <p className="mani-copy">
          O digital ficou genérico. A Mayven cria <strong>presença, percepção e crescimento</strong> para
          marcas que querem ser impossíveis de ignorar.
        </p>
      </div>
      <div className="hud hud-bl mono">MANIFESTO — SIGNAL 001</div>
    </section>
  )
}
