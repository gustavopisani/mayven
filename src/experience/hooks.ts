import { useEffect, useState } from 'react'

/* Hooks de ambiente compartilhados entre os capítulos da experiência.
   Variante única (mesma media query em todos) para hero, editorial, tipos e cases
   nunca discordarem sobre o que é "mobile". */

export function useHeroVariant() {
  const getVariant = () => {
    if (typeof window === 'undefined') return 'desktop' as const
    return window.matchMedia('(max-width: 860px), (orientation: portrait)').matches ? 'mobile' : 'desktop'
  }
  const [variant, setVariant] = useState<'desktop' | 'mobile'>(getVariant)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px), (orientation: portrait)')
    const update = () => setVariant(mq.matches ? 'mobile' : 'desktop')
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return variant
}

export function usePrefersReducedMotion() {
  const getReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [reduced, setReduced] = useState(getReduced)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}
