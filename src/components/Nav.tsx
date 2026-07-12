import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Magnetic, scrollToId } from '../lib/ui'

const MENU = [
  { id: 'manifesto', label: 'Manifesto', num: '01' },
  { id: 'tech', label: 'The Invisible Work', num: '02' },
  { id: 'build', label: 'What We Build', num: '03' },
  { id: 'system', label: 'Method', num: '04' },
  { id: 'work', label: 'Selected Signals', num: '05' },
  { id: 'operation', label: 'Operation', num: '06' },
  { id: 'media', label: 'Media Engine', num: '07' },
  { id: 'studio', label: 'Studio', num: '08' },
  { id: 'contact', label: 'Contact', num: '09' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const progressRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  /* page progress bar */
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`
      },
    })
    return () => st.kill()
  }, [])

  /* menu: scroll lock + escape + focus management */
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis
    if (open) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
      firstLinkRef.current?.focus()
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
        // keep focus inside the dialog
        if (e.key === 'Tab' && overlayRef.current) {
          const focusables = overlayRef.current.querySelectorAll<HTMLElement>('a, button')
          const first = focusables[0]
          const last = focusables[focusables.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
      window.addEventListener('keydown', onKey)
      return () => {
        window.removeEventListener('keydown', onKey)
        lenis?.start()
        document.body.style.overflow = ''
        triggerRef.current?.focus()
      }
    }
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    // let the overlay close before the scroll starts
    setTimeout(() => scrollToId(id), 60)
  }

  return (
    <>
      <header className="nav">
        <i ref={progressRef as React.RefObject<HTMLElement>} className="nav-progress" aria-hidden="true" />
        <a
          className="nav-brand"
          href="#hero"
          data-cursor=""
          onClick={(e) => {
            e.preventDefault()
            scrollToId('hero')
          }}
          aria-label="MAYVEN — voltar ao topo"
        >
          <img className="nav-mark" src="/brand/mayven-mark.png" alt="" />
          <span className="nav-word">MAYVEN</span>
        </a>
        <p className="nav-status mono">CREATIVE TECH MEDIA CO. — SP/BR</p>
        <div className="nav-actions">
          <Magnetic strength={0.25}>
            <a
              className="btn btn-small"
              href="#contact"
              data-cursor=""
              onClick={(e) => {
                e.preventDefault()
                scrollToId('contact')
              }}
            >
              Start a project
            </a>
          </Magnetic>
          <button
            ref={triggerRef}
            className="nav-menu-btn mono"
            data-cursor=""
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'FECHAR' : 'MENU'}
          </button>
        </div>
      </header>

      <div
        ref={overlayRef}
        className={`menu ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        aria-hidden={!open}
      >
        <nav className="menu-links">
          {MENU.map((m, i) => (
            <a
              key={m.id}
              ref={i === 0 ? firstLinkRef : undefined}
              href={`#${m.id}`}
              onClick={go(m.id)}
              data-cursor=""
              tabIndex={open ? 0 : -1}
              style={{ ['--i' as string]: i }}
            >
              <span className="mono">{m.num}</span>
              {m.label}
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <a href="/client" data-cursor="" tabIndex={open ? 0 : -1} className="menu-client mono">
            ÁREA DO CLIENTE →
          </a>
          <a href="mailto:hello@mayven.com.br" data-cursor="" tabIndex={open ? 0 : -1} className="mono">
            HELLO@MAYVEN.COM.BR
          </a>
        </div>
      </div>
    </>
  )
}
