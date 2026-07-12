import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'

export const useIsMobile = () => {
  const [m] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches,
  )
  return m
}

export const useReducedMotion = () => {
  const [r] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  return r
}

export const scrollToId = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis
  if (lenis) lenis.scrollTo(el, { offset: 0 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/** Magnetic wrapper — the child drifts toward the cursor and springs back. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power3.out' })
    }
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.35)' })
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [strength])
  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  )
}

/** Section video: lazy, plays only in viewport, poster image on mobile. */
export function AutoVideo({
  src,
  poster,
  className = '',
  label,
}: {
  src: string
  poster: string
  className?: string
  label: string
}) {
  const mobile = useIsMobile()
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { rootMargin: '160px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])
  if (mobile) return <img className={className} src={poster} alt={label} loading="lazy" />
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  )
}

/* The brand mark now comes straight from the official file: /brand/mayven-mark.png
   (cropped from assets/brand/logo mayven transparente.png — never redraw it by hand). */
