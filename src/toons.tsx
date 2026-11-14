// The animated, drawn scenes: the problem, one drink = one slice, where the money goes, the end card.
import React from 'react'
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Backdrop, C, DISPLAY, SANS, ease, easeOut, s } from './kit'

const pop = (f: number, at: number, fps: number, damping = 12) => spring({ frame: f - at, fps, config: { damping, stiffness: 140, mass: 0.8 } })
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

// ── Icons: flat cartoon style, 3px ink outline, soft fills ──────────────────────────────
const stroke = { stroke: '#1a1030', strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const Bank = () => (<svg viewBox="0 0 120 120" width="160" height="160"><path d="M14 46 L60 18 L106 46 Z" fill="#c9b8ff" {...stroke} /><rect x="22" y="50" width="12" height="40" fill="#efe8ff" {...stroke} /><rect x="54" y="50" width="12" height="40" fill="#efe8ff" {...stroke} /><rect x="86" y="50" width="12" height="40" fill="#efe8ff" {...stroke} /><rect x="12" y="92" width="96" height="12" rx="3" fill="#c9b8ff" {...stroke} /></svg>)
const Wallet = () => (<svg viewBox="0 0 120 120" width="160" height="160"><rect x="14" y="30" width="92" height="66" rx="14" fill="#ffb38a" {...stroke} /><path d="M14 46 H106" {...stroke} fill="none" /><rect x="70" y="56" width="36" height="22" rx="8" fill="#ffd9c4" {...stroke} /><circle cx="84" cy="67" r="4" fill="#1a1030" /></svg>)
const Seed = () => (<svg viewBox="0 0 120 120" width="160" height="160"><rect x="18" y="16" width="84" height="88" rx="10" fill="#fff6d6" {...stroke} />{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i % 2 ? 64 : 28} y={30 + Math.floor(i / 2) * 22} width="28" height="10" rx="5" fill="#d8c98f" />)}</svg>)
const Gas = () => (<svg viewBox="0 0 120 120" width="160" height="160"><rect x="24" y="22" width="50" height="80" rx="8" fill="#8fe3c0" {...stroke} /><rect x="34" y="34" width="30" height="22" rx="4" fill="#e9fff6" {...stroke} /><path d="M74 44 L92 56 V90 a8 8 0 0 1 -16 0 V74" fill="none" {...stroke} /><rect x="18" y="100" width="62" height="8" rx="3" fill="#8fe3c0" {...stroke} /></svg>)
const Bridge = () => (<svg viewBox="0 0 120 120" width="160" height="160"><path d="M8 78 Q60 18 112 78" fill="none" {...stroke} /><rect x="8" y="76" width="104" height="12" rx="3" fill="#9ec5ff" {...stroke} />{[30, 48, 66, 84].map((x) => <path key={x} d={`M${x} ${x === 30 || x === 84 ? 58 : 46} V76`} {...stroke} />)}</svg>)

/** Scene: what owning a stock on chain takes today, swept away. */
export const Problem: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const items = [
    { el: <Bank />, t: 'A brokerage' }, { el: <Wallet />, t: 'A crypto wallet' }, { el: <Seed />, t: 'A seed phrase' },
    { el: <Gas />, t: 'Gas fees' }, { el: <Bridge />, t: 'A bridge' },
  ]
  const head = pop(f, 0, fps, 200)
  const sweep = s(4.2)
  const second = pop(f, sweep + 10, fps, 200)
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: 'absolute', top: 170, width: '100%', textAlign: 'center', opacity: head * interpolate(f, [sweep, sweep + 12], [1, 0], clamp), transform: `translateY(${(1 - head) * 20}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, color: C.ink, letterSpacing: -1.5 }}>Owning a real stock on chain takes…</div>
      </div>
      <div style={{ position: 'absolute', top: 340, width: '100%', display: 'flex', justifyContent: 'center', gap: 40 }}>
        {items.map((it, i) => {
          const k = pop(f, 12 + i * 7, fps)
          const fall = interpolate(f, [sweep + i * 3, sweep + i * 3 + 22], [0, 1], { ...clamp, easing: ease })
          return (
            <div key={i} style={{ width: 270, height: 320, borderRadius: 30, background: '#1b1430', border: `2px solid ${C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
              opacity: Math.min(1, k) * (1 - fall), transform: `translateY(${(1 - k) * 60 + fall * 520}px) rotate(${fall * (i % 2 ? 18 : -14)}deg) scale(${0.6 + 0.4 * Math.min(1, k)})` }}>
              {it.el}
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink }}>{it.t}</div>
              <svg width="190" height="12" style={{ position: 'absolute', marginTop: 150 }} />
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', top: 380, width: '100%', textAlign: 'center', opacity: second, transform: `translateY(${(1 - second) * 30}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 76, color: C.ink, letterSpacing: -2, lineHeight: 1.1 }}>NYXERON hides all of it</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 76, color: C.neon, letterSpacing: -2, lineHeight: 1.1 }}>behind a night out.</div>
      </div>
    </AbsoluteFill>
  )
}

/** A cocktail glass that fills, with a slice of a share as the garnish. */
const Glass: React.FC<{ fill: number; slice: number; size?: number }> = ({ fill, slice, size = 380 }) => {
  const level = 150 - fill * 92
  return (
    <svg viewBox="0 0 240 260" width={size} height={size * 260 / 240} style={{ overflow: 'visible' }}>
      <defs><clipPath id="bowl"><path d="M30 58 H210 L130 150 H110 Z" /></clipPath></defs>
      <path d="M30 58 H210 L130 150 H110 Z" fill="#2a1f45" />
      <g clipPath="url(#bowl)"><rect x="0" y={level} width="240" height="200" fill={C.neon} opacity=".9" /><rect x="0" y={level} width="240" height="6" fill="#ffd0f4" /></g>
      <path d="M30 58 H210 L130 150 H110 Z" fill="none" stroke="#efe8ff" strokeWidth="6" strokeLinejoin="round" />
      <path d="M120 150 V222 M86 226 H154" stroke="#efe8ff" strokeWidth="7" strokeLinecap="round" />
      <g transform={`translate(176 ${-90 + slice * 136}) rotate(${(1 - slice) * -40})`} opacity={slice > 0.02 ? 1 : 0}>
        <path d="M0 0 L52 0 A52 52 0 0 0 15 -49.8 Z" fill={C.gold} stroke="#1a1030" strokeWidth="4" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

/** Scene: every drink holds 0.001 of a real share; three drinks, 0.003. */
export const OneDrink: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const fill = interpolate(f, [8, 38], [0, 1], { ...clamp, easing: ease })
  const slice = spring({ frame: f - 40, fps, config: { damping: 9, stiffness: 120 } })
  const eq = pop(f, 58, fps, 200)
  const three = interpolate(f, [s(3.4), s(4.1)], [0, 1], { ...clamp, easing: ease })
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70 }}>
        <div style={{ display: 'flex', gap: 10 + three * 10 }}>
          <Glass fill={fill} slice={Math.min(1.05, slice)} />
          {[1, 2].map((i) => (
            <div key={i} style={{ width: three * 380, overflow: 'hidden', opacity: three }}><Glass fill={1} slice={1} /></div>
          ))}
        </div>
        <div style={{ opacity: eq, transform: `translateX(${(1 - eq) * 30}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44, color: C.muted }}>{three > 0.5 ? '3 drinks' : '1 drink'}</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, lineHeight: 0.95, color: C.ink, letterSpacing: 1 }}>{three > 0.5 ? '0.003' : '0.001'}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: C.gold }}>of a real Tesla share</div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

/** A coin that travels along a straight path between two points. */
const Coin: React.FC<{ x: number; y: number; label: string; o: number }> = ({ x, y, label, o }) => (
  <div style={{ position: 'absolute', left: x - 70, top: y - 34, width: 140, height: 68, borderRadius: 34, background: C.gold, border: '4px solid #1a1030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#1a1030', opacity: o, boxShadow: '0 10px 24px rgba(0,0,0,.35)' }}>{label}</div>
)
const Box: React.FC<{ x: number; y: number; w: number; title: string; sub: string; k: number; tint?: string }> = ({ x, y, w, title, sub, k, tint = '#1b1430' }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y - 75, width: w, height: 150, borderRadius: 26, background: tint, border: `2px solid ${C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: k, transform: `scale(${0.85 + 0.15 * k})` }}>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.ink }}>{title}</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.muted, marginTop: 6 }}>{sub}</div>
  </div>
)

/** Scene: where the $1.80 goes. */
export const Split: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const P = { guest: [330, 540], contract: [960, 540], host: [1590, 330], shares: [1590, 750] }
  const k1 = pop(f, 0, fps, 200), k2 = pop(f, 6, fps, 200), k3 = pop(f, 12, fps, 200)
  const m1 = interpolate(f, [18, 48], [0, 1], { ...clamp, easing: ease })
  const m2 = interpolate(f, [58, 92], [0, 1], { ...clamp, easing: ease })
  const lerp = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
  const c1 = lerp(P.guest, P.contract, m1), cH = lerp(P.contract, P.host, m2), cS = lerp(P.contract, P.shares, m2)
  const line = (a: number[], b: number[], p: number) => <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * p} y2={a[1] + (b[1] - a[1]) * p} stroke="rgba(255,255,255,.25)" strokeWidth="4" strokeDasharray="10 12" />
  const title = pop(f, 0, fps, 200)
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: 'absolute', top: 90, width: '100%', textAlign: 'center', opacity: title, fontFamily: SANS, fontWeight: 700, fontSize: 58, color: C.ink, letterSpacing: -1.2 }}>Where Rio's $1.62 goes</div>
      <svg width="1920" height="1080" style={{ position: 'absolute' }}>
        {line(P.guest, P.contract, Math.min(1, k2))}{line(P.contract, P.host, m2)}{line(P.contract, P.shares, m2)}
      </svg>
      <Box x={P.guest[0]} y={P.guest[1]} w={380} title="Rio, the guest" sub="3 × TSLA, happy hour" k={k1} />
      <Box x={P.contract[0]} y={P.contract[1]} w={420} title="Our NEAR contract" sub="checks the price, splits it" k={k2} tint="#2a1440" />
      <Box x={P.host[0]} y={P.host[1]} w={420} title="Maya keeps $0.45" sub="the margin" k={interpolate(m2, [0.6, 1], [0.35, 1], clamp)} />
      <Box x={P.shares[0]} y={P.shares[1]} w={420} title="$1.17 buys the shares" sub="0.003 TSLA, Rio's" k={interpolate(m2, [0.6, 1], [0.35, 1], clamp)} />
      {m1 < 1 && <Coin x={c1[0]} y={c1[1] - 110} label="$1.62" o={interpolate(m1, [0, 0.1], [0, 1], clamp)} />}
      {m1 >= 1 && m2 < 1 && <><Coin x={cH[0]} y={cH[1] - 110} label="$0.45" o={1 - interpolate(m2, [0.85, 1], [0, 1], clamp)} /><Coin x={cS[0]} y={cS[1] - 110} label="$1.17" o={1 - interpolate(m2, [0.85, 1], [0, 1], clamp)} /></>}
    </AbsoluteFill>
  )
}

/** The neon sign, the stack, the address. */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const on = interpolate(f, [4, 7, 9, 12, 14, 22], [0, 0.9, 0.25, 1, 0.6, 1], clamp)
  const tag = pop(f, 20, fps, 200)
  const chips = ['Google sign-in → your own NEAR account', 'Gasless meta-transactions', 'USDC checked by our contract', 'Shares as NEP-245 tokens', 'Chain Signatures', 'NEAR Intents']
  const url = pop(f, 60, fps, 200)
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: 'absolute', top: 150, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 230, lineHeight: 0.9, letterSpacing: 8, color: '#fff4fd', opacity: on,
          textShadow: `0 0 8px ${C.neon}, 0 0 28px ${C.neon}, 0 0 80px rgba(255,63,216,.6)` }}>NYXERON</div>
        <div style={{ marginTop: 26, fontFamily: SANS, fontWeight: 600, fontSize: 50, color: C.ink, opacity: tag, transform: `translateY(${(1 - tag) * 14}px)` }}>A nightclub where every drink is a real share.</div>
      </div>
      <div style={{ position: 'absolute', top: 600, left: 160, right: 160, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        {chips.map((c, i) => {
          const k = pop(f, 30 + i * 4, fps, 200)
          return <div key={c} style={{ padding: '14px 24px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'rgba(255,255,255,.05)', fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.ink, opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>{c}</div>
        })}
      </div>
      <div style={{ position: 'absolute', bottom: 110, width: '100%', textAlign: 'center', opacity: url }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 60, color: C.gold }}>nyxeron.xyz</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.muted, marginTop: 10 }}>Built at NEAR HACKATHON · live on NEAR testnet · open source</div>
      </div>
    </AbsoluteFill>
  )
}

/** Cold open: big two-line question over the club at full tilt. */
export const OpenTitle: React.FC = () => {
  const f = useCurrentFrame()
  const line = (at: number) => interpolate(f, [at, at + 16], [0, 1], { ...clamp, easing: easeOut })
  const a = line(10), b = line(22)
  const L: React.FC<{ k: number; children: React.ReactNode; color?: string }> = ({ k, children, color = '#fff' }) => (
    <div style={{ overflow: 'hidden', lineHeight: 0.95 }}><div style={{ transform: `translateY(${(1 - k) * 110}%)`, fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, letterSpacing: 2, color, textTransform: 'uppercase' }}>{children}</div></div>
  )
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 110px 120px', background: 'linear-gradient(180deg, transparent 35%, rgba(7,5,15,.85) 80%)' }}>
      <L k={a}>What if every drink</L>
      <L k={b} color={C.neon}>was a real share?</L>
    </AbsoluteFill>
  )
}

export const Logo: React.FC<{ size?: number }> = ({ size = 64 }) => <Img src={staticFile('mark.svg')} style={{ width: size, height: size }} />
