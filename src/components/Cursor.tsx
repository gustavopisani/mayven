import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const dot = dotRef.current!
    const ring = ringRef.current!
    document.documentElement.classList.add('has-cursor')

    const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' })
    const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' })
    const rx = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' })
    const ry = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' })

    const move = (e: MouseEvent) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }
    const over = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest?.('[data-cursor]') as HTMLElement | null
      const label = t?.dataset.cursor ?? ''
      ring.dataset.label = label
      ring.classList.toggle('is-active', !!t)
    }
    window.addEventListener('mousemove', move, { passive: true })
    window.addEventListener('mouseover', over, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
