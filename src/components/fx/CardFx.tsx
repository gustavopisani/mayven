/** Six distinct hover micro-scenes — pure CSS/SVG, animated only while the card is hovered/focused. */
export default function CardFx({ kind }: { kind: string }) {
  switch (kind) {
    case 'brand':
      // scattered letters assemble into structure
      return (
        <div className="fx fx-brand" aria-hidden="true">
          {'MARCA'.split('').map((c, i) => (
            <span key={i} style={{ ['--i' as string]: i }}>
              {c}
            </span>
          ))}
          <i className="fx-brand-line" />
        </div>
      )
    case 'web':
      // browser frame bending in 3D
      return (
        <div className="fx fx-web" aria-hidden="true">
          <div className="fx-browser">
            <i />
            <b />
            <b style={{ width: '55%' }} />
            <b style={{ width: '72%' }} />
          </div>
        </div>
      )
    case 'tech':
      // particle burst over a grid
      return (
        <div className="fx fx-tech" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} style={{ ['--a' as string]: `${i * 30}deg`, ['--d' as string]: `${26 + (i % 4) * 9}px` }} />
          ))}
        </div>
      )
    case 'content':
      // content cards orbiting a core
      return (
        <div className="fx fx-content" aria-hidden="true">
          <i className="fx-core" />
          {[0, 1, 2].map((i) => (
            <span key={i} className="fx-orbit" style={{ ['--i' as string]: i }}>
              <b />
            </span>
          ))}
        </div>
      )
    case 'media':
      // performance signal drawing itself
      return (
        <svg className="fx fx-media" viewBox="0 0 120 44" aria-hidden="true">
          <polyline
            className="fx-graph"
            points="0,36 18,30 32,33 48,20 64,24 82,10 100,14 120,4"
            fill="none"
            strokeWidth="1.5"
          />
          <circle className="fx-ping" cx="120" cy="4" r="2.5" />
        </svg>
      )
    case 'ai':
      // workflow nodes wiring up
      return (
        <svg className="fx fx-ai" viewBox="0 0 120 44" aria-hidden="true">
          <path className="fx-wire" d="M8 22 H40 M40 22 L64 8 M40 22 L64 36 M64 8 H96 M64 36 H96 M96 8 L112 22 M96 36 L112 22" fill="none" strokeWidth="1.2" />
          {[
            [8, 22],
            [40, 22],
            [64, 8],
            [64, 36],
            [96, 8],
            [96, 36],
            [112, 22],
          ].map(([x, y], i) => (
            <circle key={i} className="fx-node" cx={x} cy={y} r="3" style={{ ['--i' as string]: i }} />
          ))}
        </svg>
      )
    default:
      return null
  }
}
