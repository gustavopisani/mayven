import { useState } from 'react'

/* Entrada de projeto — "O que você quer colocar no mundo?"
   Canal de envio: não existe backend no projeto; o envio abre o cliente de
   e-mail com a mensagem estruturada (funciona hoje, sem promessa falsa).
   Para trocar por um endpoint real: substitua APENAS submitChannel(). */

const DESAFIOS = [
  'Uma presença mais forte',
  'Uma nova experiência digital',
  'Uma jornada de compra diferente',
  'Um lançamento',
  'Uma ativação',
  'Um espaço conectado',
  'Algo que ainda não tem formato definido',
]

const FAIXAS = ['Prefiro não informar', 'Até R$ 30 mil', 'R$ 30–80 mil', 'R$ 80–200 mil', 'Acima de R$ 200 mil']

type Fields = {
  nome: string
  empresa: string
  email: string
  whatsapp: string
  desafio: string
  descricao: string
  faixa: string
}

const EMPTY: Fields = { nome: '', empresa: '', email: '', whatsapp: '', desafio: '', descricao: '', faixa: '' }

function submitChannel(f: Fields) {
  const body = [
    `Nome: ${f.nome}`,
    `Empresa: ${f.empresa}`,
    `E-mail: ${f.email}`,
    f.whatsapp && `WhatsApp: ${f.whatsapp}`,
    `Desafio: ${f.desafio}`,
    f.faixa && f.faixa !== FAIXAS[0] && `Faixa de investimento: ${f.faixa}`,
    '',
    'Ambição:',
    f.descricao,
  ]
    .filter(Boolean)
    .join('\n')
  const url = `mailto:hello@mayven.com.br?subject=${encodeURIComponent(`Novo projeto — ${f.empresa || f.nome}`)}&body=${encodeURIComponent(body)}`
  window.location.href = url
}

export default function ContactForm() {
  const [f, setF] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF((p) => ({ ...p, [k]: e.target.value }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }))
  }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (f.nome.trim().length < 2) e.nome = 'Como podemos te chamar?'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Precisamos de um e-mail válido.'
    if (!f.desafio) e.desafio = 'Escolha o que mais se aproxima.'
    if (f.descricao.trim().length < 10) e.descricao = 'Conte um pouco mais — duas frases bastam.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (state !== 'idle') return
    if (!validate()) return
    setState('sending')
    // simula latência mínima para o feedback ser perceptível; o canal é síncrono (mailto)
    setTimeout(() => {
      try {
        submitChannel(f)
        setState('sent')
      } catch {
        setState('idle')
        setErrors({ descricao: 'Algo falhou ao abrir seu e-mail. Escreva direto para hello@mayven.com.br.' })
      }
    }, 450)
  }

  if (state === 'sent') {
    return (
      <div className="x-form-sent" role="status">
        <p className="x-mono">MENSAGEM PREPARADA ●</p>
        <h3>Seu e-mail abriu com tudo pronto — é só enviar.</h3>
        <p>
          Se preferir, escreva direto para <a href="mailto:hello@mayven.com.br">hello@mayven.com.br</a>.
          A gente responde rápido.
        </p>
        <button type="button" className="x-btn" onClick={() => { setF(EMPTY); setState('idle') }} data-x="">
          Enviar outra ideia
        </button>
      </div>
    )
  }

  return (
    <form className="x-form" onSubmit={onSubmit} noValidate>
      <p className="x-form-ask">O que você quer colocar no mundo?</p>

      <div className="x-form-grid">
        <label>
          <span className="x-mono">NOME *</span>
          <input type="text" value={f.nome} onChange={set('nome')} autoComplete="name" aria-invalid={!!errors.nome} />
          {errors.nome && <em className="x-form-err">{errors.nome}</em>}
        </label>
        <label>
          <span className="x-mono">EMPRESA</span>
          <input type="text" value={f.empresa} onChange={set('empresa')} autoComplete="organization" />
        </label>
        <label>
          <span className="x-mono">E-MAIL *</span>
          <input type="email" value={f.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} />
          {errors.email && <em className="x-form-err">{errors.email}</em>}
        </label>
        <label>
          <span className="x-mono">WHATSAPP</span>
          <input type="tel" value={f.whatsapp} onChange={set('whatsapp')} autoComplete="tel" placeholder="+55" />
        </label>
        <label className="x-form-full">
          <span className="x-mono">TIPO DE DESAFIO *</span>
          <select value={f.desafio} onChange={set('desafio')} aria-invalid={!!errors.desafio}>
            <option value="">Escolha…</option>
            {DESAFIOS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.desafio && <em className="x-form-err">{errors.desafio}</em>}
        </label>
        <label className="x-form-full">
          <span className="x-mono">A AMBIÇÃO *</span>
          <textarea rows={4} value={f.descricao} onChange={set('descricao')} aria-invalid={!!errors.descricao}
            placeholder="O que precisa existir, para quem, e o que deve acontecer quando existir." />
          {errors.descricao && <em className="x-form-err">{errors.descricao}</em>}
        </label>
        <label className="x-form-full">
          <span className="x-mono">FAIXA DE INVESTIMENTO (OPCIONAL)</span>
          <select value={f.faixa} onChange={set('faixa')}>
            <option value="">Escolha…</option>
            {FAIXAS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit" className="x-btn x-btn-solid x-form-submit" disabled={state === 'sending'} data-x="">
        {state === 'sending' ? 'PREPARANDO…' : 'Comece um projeto'}
      </button>
    </form>
  )
}
