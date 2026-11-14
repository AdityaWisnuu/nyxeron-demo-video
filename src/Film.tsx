// "One night, two people": Maya hosts, Rio goes out. Party first, the twist (the drinks were real shares), then proof.
// Voice: ElevenLabs v4 (Jessica). Music: Papi Jarang Pulang, 119 BPM, ducked under the voice.
import React from 'react'
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, Caption, Cam, DISPLAY, Mark, SANS, Scene, Screen, Stamp, ease, easeOut, s } from './kit'
import { EndCard, Split } from './toons'

const BEAT = 60 / 119
const b = (n: number) => Math.round(n * BEAT * 30)

type Shot = { src: string; from: number; dur: number; rate?: number; cams?: Cam[]; marks?: Mark[]; full?: boolean }

const FadeBox: React.FC<{ len: number; first: boolean; last: boolean; hard?: boolean; children: React.ReactNode }> = ({ len, first, last, hard, children }) => {
  const f = useCurrentFrame()
  if (hard) return <AbsoluteFill>{children}</AbsoluteFill>
  const o = Math.min(first ? 1 : interpolate(f, [0, 8], [0, 1], { extrapolateRight: 'clamp' }), last ? 1 : interpolate(f, [len - 8, len], [1, 0], { extrapolateLeft: 'clamp' }))
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>
}
const Shots: React.FC<{ shots: Shot[]; hard?: boolean }> = ({ shots, hard }) => {
  let at = 0
  const ov = hard ? 0 : 8
  return (
    <>
      {shots.map((sh, i) => {
        const len = s(sh.dur), start = at
        at += len - (i < shots.length - 1 ? ov : 0)
        return (
          <Sequence key={i} from={start} durationInFrames={len}>
            <FadeBox len={len} first={i === 0} last={i === shots.length - 1} hard={hard}>
              <Screen src={sh.src} from={sh.from} rate={sh.rate} cams={sh.cams} marks={sh.marks} full={sh.full} />
            </FadeBox>
          </Sequence>
        )
      })}
    </>
  )
}
const shotsLen = (shots: Shot[], hard = false) => shots.reduce((a, sh) => a + s(sh.dur), 0) - (hard ? 0 : 8 * (shots.length - 1))

const punch = (x: number, y: number, z0: number, z1: number, d: number): Cam[] => [{ t: 0, x, y, z: z0 }, { t: d, x, y, z: z1 }]
const D2 = 2 * BEAT

const BeatFlash: React.FC<{ every: number; count: number }> = ({ every, count }) => {
  const f = useCurrentFrame()
  if (f >= every * count) return null
  return <AbsoluteFill style={{ background: '#fff', opacity: interpolate(f % every, [0, 4], [0.25, 0], { extrapolateRight: 'clamp' }), mixBlendMode: 'screen' }} />
}

/** A big neon word over the club, for chapter beats. */
const Neon: React.FC<{ top?: string; big: string; at?: number }> = ({ top, big, at = 2 }) => {
  const f = useCurrentFrame()
  const on = interpolate(f - at, [0, 2, 4, 6, 9], [0, 1, 0.3, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(60% 50% at 50% 50%, rgba(7,5,15,.15), rgba(7,5,15,.7))' }}>
      <div style={{ textAlign: 'center', opacity: on }}>
        {top && <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 120, color: C.neon, letterSpacing: 4, textShadow: `0 0 20px ${C.neon}` }}>{top}</div>}
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, lineHeight: 0.9, letterSpacing: 6, color: '#fff4fd', textTransform: 'uppercase', textShadow: `0 0 10px ${C.neon}, 0 0 40px ${C.neon}` }}>{big}</div>
      </div>
    </AbsoluteFill>
  )
}

const TitleSlam: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const on = interpolate(f, [0, 2, 4, 6, 8, 12], [0, 1, 0.2, 1, 0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sc = interpolate(f, [0, 10], [1.12, 1], { extrapolateRight: 'clamp', easing: easeOut })
  const tag = spring({ frame: f - 14, fps, config: { damping: 200 }, durationInFrames: 18 })
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Screen src="r-show" from={13} full cams={punch(960, 540, 1.05, 1.15, 4)} />
      <AbsoluteFill style={{ background: 'radial-gradient(60% 55% at 50% 50%, rgba(42,13,61,.55), rgba(7,5,15,.85) 80%)' }} />
      <div style={{ textAlign: 'center', transform: `scale(${sc})`, position: 'relative' }}>
        <Img src={staticFile('mark.svg')} style={{ width: 110, height: 110, filter: 'invert(1)', opacity: on, marginBottom: 14 }} />
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 240, lineHeight: 0.86, letterSpacing: 10, color: '#fff4fd', opacity: on, textShadow: `0 0 10px ${C.neon}, 0 0 34px ${C.neon}, 0 0 90px rgba(255,63,216,.7)` }}>NYXERON</div>
        <div style={{ marginTop: 22, fontFamily: SANS, fontWeight: 600, fontSize: 44, color: C.ink, opacity: tag, transform: `translateY(${(1 - tag) * 16}px)` }}>Run the club. Throw the party.</div>
      </div>
    </AbsoluteFill>
  )
}

const Glass: React.FC<{ fill?: number }> = ({ fill = 1 }) => (
  <svg viewBox="0 0 240 260" width={200} height={216} style={{ overflow: 'visible' }}>
    <defs><clipPath id="bw"><path d="M30 58 H210 L130 150 H110 Z" /></clipPath></defs>
    <path d="M30 58 H210 L130 150 H110 Z" fill="#2a1f45" />
    <g clipPath="url(#bw)"><rect x="0" y={150 - fill * 92} width="240" height="200" fill={C.neon} opacity=".9" /></g>
    <path d="M30 58 H210 L130 150 H110 Z" fill="none" stroke="#efe8ff" strokeWidth="6" strokeLinejoin="round" />
    <path d="M120 150 V222 M86 226 H154" stroke="#efe8ff" strokeWidth="7" strokeLinecap="round" />
  </svg>
)
/** Rio's three drinks over the bar he bought them at; on the drop each one flips into a TSLA share. */
const Twist: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const drop = b(6)
  const l1 = spring({ frame: f - 4, fps, config: { damping: 200 }, durationInFrames: 16 })
  const l1out = interpolate(f, [drop - 6, drop], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const t = interpolate(f, [drop, drop + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const tsc = interpolate(f, [drop, drop + 8], [1.2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
  const sum = spring({ frame: f - (drop + 26), fps, config: { damping: 200 }, durationInFrames: 16 })
  return (
    <AbsoluteFill style={{ background: '#07050f', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: `blur(${10 + (1 - t) * 6}px) brightness(${0.45 - t * 0.1})`, transform: 'scale(1.08)' }}>
        <Screen src="r-party" from={47} full />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(55% 50% at 50% 55%, rgba(255,63,216,${0.28 * t}), transparent 70%)` }} />
      <div style={{ position: 'absolute', top: 150, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 60, color: C.ink, opacity: l1 * l1out, transform: `translateY(${(1 - l1) * 20}px)`, textShadow: '0 2px 18px rgba(0,0,0,.8)' }}>Oh, one thing about those drinks…</div>
      </div>
      <div style={{ position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: t, transform: `scale(${tsc})` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 168, lineHeight: 0.9, letterSpacing: 4, textTransform: 'uppercase', color: '#fff4fd', textShadow: `0 0 10px ${C.neon}, 0 0 40px ${C.neon}` }}>They were real shares</div>
      </div>
      <div style={{ position: 'absolute', top: 400, width: '100%', display: 'flex', justifyContent: 'center', gap: 90 }}>
        {[0, 1, 2].map((i) => {
          const pop = spring({ frame: f - (8 + i * 5), fps, config: { damping: 12, stiffness: 150 } })
          const flip = interpolate(f, [drop + 4 + i * 4, drop + 14 + i * 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
          const showCoin = flip > 0.5
          const sx = Math.abs(Math.cos(flip * Math.PI))
          return (
            <div key={i} style={{ width: 220, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: Math.min(1, pop), transform: `translateY(${(1 - Math.min(1, pop)) * 40}px)` }}>
              <div style={{ transform: `scaleX(${sx})`, height: 220, display: 'flex', alignItems: 'center' }}>
                {showCoin
                  ? <Img src={staticFile('logos/tsla.svg')} style={{ width: 190, height: 190, borderRadius: 52, boxShadow: `0 0 40px rgba(204,0,0,.55), 0 18px 40px rgba(0,0,0,.5)` }} />
                  : <Glass />}
              </div>
              <div style={{ marginTop: 16, fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: showCoin ? C.gold : C.muted, letterSpacing: 1 }}>{showCoin ? '0.001 TSLA' : 'drink'}</div>
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', top: 760, width: '100%', textAlign: 'center', opacity: sum, transform: `translateY(${(1 - sum) * 16}px)` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 96, color: C.gold, letterSpacing: 2, textShadow: '0 0 30px rgba(255,201,74,.4)' }}>= 0.003 of a real Tesla share</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.ink, marginTop: 6 }}>Every drink holds 0.001 of a real stock</div>
      </div>
    </AbsoluteFill>
  )
}

// ── Shots ────────────────────────────────────────────────────────────────────────────────────
const COLD: Shot[] = [
  { src: 'r-show', from: 1.0, dur: D2, full: true, cams: punch(960, 560, 1.1, 1.22, D2) },
  { src: 'r-show', from: 7.5, dur: D2, full: true, cams: punch(900, 500, 1.15, 1.3, D2) },
  { src: 'n-pr', from: 30.0, dur: D2, full: true, cams: punch(900, 520, 1.25, 1.4, D2) },
  { src: 'r-show', from: 19.5, dur: D2, full: true, cams: punch(980, 540, 1.1, 1.25, D2) },
  { src: 'r-show', from: 26.0, dur: D2, full: true, cams: punch(1000, 560, 1.1, 1.25, D2) },
  { src: 'n-pr', from: 39.5, dur: D2, full: true, cams: punch(1000, 600, 1.3, 1.45, D2) },
  { src: 'r-show', from: 31.0, dur: D2, full: true, cams: punch(960, 540, 1.1, 1.25, D2) },
  { src: 'r-show', from: 4.0, dur: D2, full: true, cams: punch(960, 520, 1.15, 1.3, D2) },
]
const MAYA: Shot[] = [
  { src: 'm-setup', from: 1.2, dur: 8.2, rate: 1.4, cams: [{ t: 0, x: 960, y: 300, z: 1.25 }, { t: 6.5, x: 1200, y: 300, z: 1.3 }] },
  { src: 'm-setup', from: 50.6, dur: 6.4, rate: 1.15, cams: [{ t: 0, x: 960, y: 420, z: 1.2 }, { t: 1.0, x: 560, y: 420, z: 1.75 }, { t: 4.6, x: 560, y: 420, z: 1.75 }, { t: 6.0, x: 1300, y: 560, z: 1.5 }] },
  { src: 'm-setup', from: 58.0, dur: 6.0, cams: [{ t: 0, x: 960, y: 780, z: 1.35 }, { t: 2.6, x: 960, y: 800, z: 1.4 }] },
]
const RIO_IN: Shot[] = [
  { src: 'r-signin', from: 1.2, dur: 5.0, rate: 1.2, cams: [{ t: 0, x: 960, y: 540, z: 1 }, { t: 4, x: 1150, y: 640, z: 1.12 }] },
  { src: 'r-signin', from: 21.6, dur: 5.0, cams: [{ t: 0, x: 960, y: 540, z: 1.5 }, { t: 2, x: 960, y: 560, z: 1.75 }] },
]
const RIO_PARTY: Shot[] = [
  { src: 'r-party', from: 2.6, dur: 4.4, cams: [{ t: 0, x: 960, y: 300, z: 1.25 }, { t: 2.4, x: 800, y: 300, z: 1.4 }] },
  { src: 'r-show', from: 10.0, dur: 3.0, full: true, cams: punch(960, 540, 1.1, 1.2, 3) },
  { src: 'r-party', from: 33.2, dur: 2.2, cams: [{ t: 0, x: 960, y: 480, z: 1.15 }, { t: 1.2, x: 560, y: 470, z: 1.85 }] },
  { src: 'r-party', from: 35.4, dur: 2.2, rate: 3, cams: [{ t: 0, x: 560, y: 470, z: 1.85 }] },
  { src: 'r-party', from: 42.0, dur: 4.6, cams: [{ t: 0, x: 560, y: 470, z: 1.85 }, { t: 2.2, x: 560, y: 470, z: 1.85 }, { t: 3.4, x: 1300, y: 470, z: 1.5 }], marks: [{ from: 3.6, to: 4.6, x: 1250, y: 520, w: 320, h: 34 }] },
  { src: 'r-show', from: 14.0, dur: 3.0, full: true, cams: punch(960, 540, 1.1, 1.22, 3) },
]
const TX: Shot[] = [
  { src: 'r-tx', from: 0.6, dur: 7.6, cams: [{ t: 0, x: 960, y: 330, z: 1.2 }, { t: 1.2, x: 720, y: 412, z: 1.85 }, { t: 4.6, x: 720, y: 412, z: 1.85 }, { t: 5.6, x: 560, y: 720, z: 1.7 }],
    marks: [{ from: 1.4, to: 3.2, x: 412, y: 388, w: 510, h: 26 }, { from: 3.2, to: 4.8, x: 412, y: 412, w: 510, h: 26 }, { from: 5.8, to: 7.4, x: 410, y: 744, w: 74, h: 34 }] },
]
const PROOF: Shot[] = [{ src: 'n-proof2', from: 0.4, dur: 5.0, cams: [{ t: 0, x: 960, y: 330, z: 1.3 }, { t: 2.4, x: 960, y: 520, z: 1.35 }] }]

// ── Running order ───────────────────────────────────────────────────────────────────────────────
const HOME_FROM = 2.7
type Part = { len: number; el: React.ReactNode; edge?: number; tag?: string; vo?: [string, number][] }
const parts: Part[] = [
  { tag: 'cold', len: shotsLen(COLD, true), edge: 1, el: (<><Shots shots={COLD} hard /><BeatFlash every={b(2)} count={COLD.length} /></>) },
  { tag: 'title', len: s(6.6), edge: 6, el: <TitleSlam />, vo: [['l01b', 0.3]] },
  { len: shotsLen(MAYA), vo: [['l02', 0.3], ['l03b', 7.9], ['l04', 15.0]], el: (
    <><Shots shots={MAYA} /><Stamp time="22:00" label="Maya · the host" />
      <Caption from={0.3} to={7.4}>Meet Maya. Tonight, she's throwing the party.</Caption>
      <Caption from={7.9} to={14.4}>She sets the prices at the bar</Caption>
      <Caption from={15.0} to={19.6} sub="Happy hour, pyro, the works">Then she turns it all the way up</Caption></>) },
  { len: b(4), edge: 6, el: (<><Screen src="n-pr" from={5.4} full cams={punch(960, 540, 1.3, 1.45, 2.2)} /><Neon top="23:00" big="Doors open" /></>) },
  { len: shotsLen(RIO_IN), vo: [['l05', 0.3]], el: (
    <><Shots shots={RIO_IN} /><Stamp time="23:15" label="Rio · the guest" />
      <Caption from={0.3} to={4.6}>And this is Rio. He just wants a good night out.</Caption>
      <Caption from={4.8} to={9.6} sub="His own NEAR account is made for him">No wallet. No seed phrase. Just Google.</Caption></>) },
  { tag: 'buy', len: shotsLen(RIO_PARTY), vo: [['l06', 0.3], ['l07', 6.8]], el: (
    <><Shots shots={RIO_PARTY} /><Stamp time="23:30" label="Friday Night" />
      <Caption from={0.3} to={6.4}>He finds Maya's party, walks right in…</Caption>
      <Caption from={6.8} to={13.8} sub="No wallet pop-up. No gas.">…and grabs three Teslas at the bar</Caption></>) },
  { tag: 'twist', len: b(15), edge: 4, el: <Twist />, vo: [['l08', 0.3], ['l09', 6 * BEAT + 0.05]] },
  { len: shotsLen(TX), vo: [['l10', 0.4]], el: (
    <><Shots shots={TX} /><Stamp time="23:31" label="On chain" />
      <Caption from={0.4} to={4.8} sub="1.62 USDC in, 0.45 straight to Maya">Rio paid on NEAR</Caption>
      <Caption from={5.0} to={7.4} sub="A meta-transaction: the relayer pays">No gas. No pop-ups.</Caption></>) },
  { len: s(5.6), el: <Split />, vo: [['l11', 0.6]] },
  { len: b(4), edge: 6, el: (<><Screen src="r-show" from={25.5} full cams={punch(960, 540, 1.15, 1.3, 2.2)} /><Neon top="04:00" big="Last call" /></>) },
  { tag: 'home', len: s(6.0), vo: [['l12', 0.3]], el: (
    <><Screen src="r-home" from={HOME_FROM} cams={[{ t: 0, x: 960, y: 540, z: 1.05 }, { t: 6, x: 960, y: 560, z: 1.15 }]} /><Stamp time="04:00" label="The shares go home" />
      <Caption from={0.3} to={5.6} sub="0.003 TSLA, delivered as a NEP-245 token">And when the party's over, the shares go home</Caption></>) },
  { len: shotsLen(PROOF), el: (
    <><Shots shots={PROOF} /><Stamp time="04:10" label="Proof" />
      <Caption from={0.3} to={4.6} sub="The contract, the warehouse, every share">Check it all on chain</Caption></>) },
  { tag: 'end', len: s(7.0), el: <EndCard />, vo: [['l13', 0.4]] },
]

const X = 10
const starts: number[] = []
{
  let a = 0
  for (const p of parts) { starts.push(a); a += p.len - (p.edge ?? X) }
}
export const FILM_LEN = starts[starts.length - 1]! + parts[parts.length - 1]!.len
const at = (tag: string) => starts[parts.findIndex((p) => p.tag === tag)]!
const VO: { id: string; f: number; len: number }[] = []
const VOLEN: Record<string, number> = { l01: 6.03, l01b: 4.99, l03b: 4.6, l02: 3.87, l03: 5.64, l04: 3.4, l05: 6.35, l06: 3.32, l07: 2.51, l08: 3.32, l09: 1.96, l10: 3.71, l11: 3.32, l12: 3.08, l13: 5.56 }
parts.forEach((p, i) => p.vo?.forEach(([id, t]) => VO.push({ id, f: starts[i]! + s(t), len: s(VOLEN[id]!) })))

export const Film: React.FC = () => {
  const twist = at('twist'), drop = twist + b(6)
  // How much the voice is on at frame f, eased in and out so the music never jumps.
  const talk = (f: number) => {
    let k = 0
    for (const v of VO) {
      const a = v.f - 8, b2 = v.f + v.len + 6
      if (f >= a - 10 && f <= b2 + 14) k = Math.max(k, interpolate(f, [a - 10, a, b2, b2 + 14], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
    }
    return k
  }
  const base = (f: number) => interpolate(f, [0, 6, FILM_LEN - 80, FILM_LEN], [0, 0.9, 0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const clear = (f: number) => (f < twist - 4 || f >= drop ? 1 : f < twist + 6 ? interpolate(f, [twist - 4, twist + 6], [1, 0], { easing: ease }) : 0)
  const ding = at('buy') + s(4.4) + s(3.0) + s(2.2) + s(2.2) - 4 * 8 + 6
  return (
    <AbsoluteFill style={{ background: '#07050f' }}>
      {parts.map((p, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={p.len}>
          <Scene dur={p.len} edge={p.edge ?? X}>{p.el}</Scene>
        </Sequence>
      ))}
      {/* full music between lines; under a line, a mid-scooped copy at a low level so the voice sits on top */}
      <Audio src={staticFile('audio/track-n.mp3')} volume={(f) => base(f) * clear(f) * (1 - talk(f))} />
      <Audio src={staticFile('audio/track-duck.mp3')} volume={(f) => base(f) * clear(f) * talk(f) * 0.22} />
      <Audio src={staticFile('audio/track-muffled.mp3')} volume={(f) => base(f) * (1 - clear(f)) * 0.35} />
      {VO.map((v, i) => <Sequence key={i} from={v.f}><Audio src={staticFile(`vo/${v.id}.mp3`)} volume={1} /></Sequence>)}
      <Sequence from={at('title')}><Audio src={staticFile('audio/boom.wav')} volume={0.5} /></Sequence>
      <Sequence from={drop}><Audio src={staticFile('audio/boom.wav')} volume={0.55} /></Sequence>
      <Sequence from={ding}><Audio src={staticFile('audio/ding.wav')} volume={0.45} /></Sequence>
      <Sequence from={at('home') + 18}><Audio src={staticFile('audio/ding.wav')} volume={0.4} /></Sequence>
    </AbsoluteFill>
  )
}
