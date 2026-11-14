// Shared pieces: tokens, fonts, the framed screen with an eased camera, captions, chapter stamps, highlights.
import React from 'react'
import {
  AbsoluteFill, Easing, OffthreadVideo, continueRender, delayRender, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion'

export const FPS = 30
export const C = {
  night: '#07050f',
  panel: '#120d22',
  ink: '#f6f3ff',
  muted: '#b9b0d6',
  neon: '#ff3fd8',
  gold: '#ffc94a',
  green: '#3ee08f',
  line: 'rgba(255,255,255,.14)',
}
export const DISPLAY = "'Big Shoulders', sans-serif"
export const SANS = "'Geist', system-ui, sans-serif"

// Fonts load once before the first frame renders.
const fontHandle = delayRender('fonts')
Promise.all([
  new FontFace('Big Shoulders', `url(${staticFile('fonts/big-shoulders-display.woff2')})`, { weight: '100 900' }).load(),
  new FontFace('Geist', `url(${staticFile('fonts/geist.woff2')})`, { weight: '100 900' }).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fontHandle) })

export const ease = Easing.bezier(0.65, 0, 0.35, 1)
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1)
export const s = (sec: number) => Math.round(sec * FPS)

/** 0→1 entrance with a soft spring, starting at `at` frames. */
export const useIn = (at = 0, damping = 200, durationInFrames?: number) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  return spring({ frame: f - at, fps, config: { damping, mass: 0.9 }, durationInFrames })
}

/** Fades a whole scene in and out over `edge` frames. */
export const Scene: React.FC<{ dur: number; edge?: number; children: React.ReactNode; bg?: string }> = ({ dur, edge = 10, children, bg = C.night }) => {
  const f = useCurrentFrame()
  const o = interpolate(f, [0, edge, dur - edge, dur], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
  const sc = interpolate(f, [0, edge * 2], [1.025, 1], { extrapolateRight: 'clamp', easing: easeOut })
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${sc})`, background: bg }}>{children}</AbsoluteFill>
}

/** The backdrop behind every screen: deep night with two slow, soft glows. */
export const Backdrop: React.FC<{ club?: boolean }> = ({ club = true }) => {
  const f = useCurrentFrame()
  const a = Math.sin(f / 90) * 60, b = Math.cos(f / 110) * 50
  return (
    <AbsoluteFill style={{ background: C.night, overflow: 'hidden' }}>
      {club && (
        <OffthreadVideo src={staticFile('clips/bg-club.mp4')} muted
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.42, transform: 'scale(1.06)' }} />
      )}
      <div style={{ position: 'absolute', width: 1300, height: 1300, left: -350 + a, top: -650 + b, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,63,216,.22), transparent 62%)' }} />
      <div style={{ position: 'absolute', width: 1200, height: 1200, right: -420 - a, bottom: -700 - b, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,80,255,.20), transparent 62%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(80% 75% at 50% 45%, transparent 40%, rgba(7,5,15,.85) 100%)' }} />
    </AbsoluteFill>
  )
}

export type Cam = { t: number; x: number; y: number; z: number } // t in output seconds, focus point in screen px, zoom
export type Mark = { from: number; to: number; x: number; y: number; w: number; h: number; label?: string } // output seconds, screen px
export type Blur = { from?: number; to?: number; x: number; y: number; w: number; h: number; bg?: string; ink?: string; text?: string; size?: number }

const camAt = (cams: Cam[], t: number) => {
  if (t <= cams[0].t) return cams[0]
  for (let i = 0; i < cams.length - 1; i++) {
    const a = cams[i], b = cams[i + 1]
    if (t <= b.t) {
      const k = ease((t - a.t) / Math.max(0.001, b.t - a.t))
      return { t, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k }
    }
  }
  return cams[cams.length - 1]
}

/**
 * A screen recording inside a floating window. The camera eases between focus points;
 * marks draw a soft ring around what matters; blurs hide private details.
 */
export const Screen: React.FC<{
  src: string; from: number; rate?: number; cams?: Cam[]; marks?: Mark[]; blurs?: Blur[]; full?: boolean; volume?: number
}> = ({ src, from, rate = 1, cams = [{ t: 0, x: 960, y: 540, z: 1 }], marks = [], blurs = [], full = false }) => {
  const f = useCurrentFrame(); const t = f / FPS
  const c = camAt(cams, t)
  const half = { x: 960 / c.z, y: 540 / c.z }
  const fx = Math.min(1920 - half.x, Math.max(half.x, c.x)), fy = Math.min(1080 - half.y, Math.max(half.y, c.y))
  const tx = 960 - fx * c.z, ty = 540 - fy * c.z
  const W = full ? 1920 : 1440, scale = W / 1920, H = 1080 * scale
  return (
    <AbsoluteFill>
      {!full && <Backdrop />}
      <div style={{
        position: 'absolute', left: (1920 - W) / 2, top: full ? 0 : 84, width: W, height: H,
        borderRadius: full ? 0 : 22, overflow: 'hidden', boxShadow: full ? 'none' : '0 40px 120px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.10)',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `scale(${scale}) translate(${tx}px, ${ty}px) scale(${c.z})` }}>
          <OffthreadVideo src={staticFile(`clips/${src}.mp4`)} startFrom={Math.round(from * FPS)} playbackRate={rate} muted style={{ width: 1920, height: 1080 }} />
          {blurs.map((b, i) => (t >= (b.from ?? -1) && t <= (b.to ?? 1e9)) && (
            <div key={i} style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, background: b.bg ?? '#160d26', display: 'flex', alignItems: 'center', justifyContent: b.text && b.bg === '#ffffff' ? 'center' : 'flex-start', paddingLeft: 7, fontFamily: SANS, fontWeight: 600, fontSize: b.size ?? 17, color: b.ink ?? '#f6f3ff' }}>{b.text}</div>
          ))}
          {marks.map((m, i) => <Ring key={i} m={m} t={t} />)}
        </div>
      </div>
    </AbsoluteFill>
  )
}

const Ring: React.FC<{ m: Mark; t: number }> = ({ m, t }) => {
  if (t < m.from - 0.1 || t > m.to + 0.4) return null
  const inK = easeOut(Math.min(1, Math.max(0, (t - m.from) / 0.45)))
  const outK = 1 - ease(Math.min(1, Math.max(0, (t - m.to) / 0.35)))
  const o = inK * outK, pad = 10 + (1 - inK) * 18
  return (
    <div style={{ position: 'absolute', left: m.x - pad, top: m.y - pad, width: m.w + pad * 2, height: m.h + pad * 2, opacity: o,
      borderRadius: 14, border: `3px solid ${C.gold}`, boxShadow: `0 0 0 6px rgba(255,201,74,.18), 0 0 28px rgba(255,201,74,.35)` }} />
  )
}

/** A caption that reads at a glance: big, plain, high contrast, eased in and out. */
export const Caption: React.FC<{ from: number; to: number; children: React.ReactNode; sub?: string; top?: boolean }> = ({ from, to, children, sub }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const a = s(from), b = s(to)
  if (f < a - 1 || f > b + 12) return null
  const k = spring({ frame: f - a, fps, config: { damping: 200 }, durationInFrames: 16 })
  const out = interpolate(f, [b, b + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
  const shadow = '0 2px 0 rgba(0,0,0,.6), 0 0 24px rgba(7,5,15,.9)'
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 912, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: k * out, transform: `translateY(${(1 - k) * 14}px)` }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 62, lineHeight: 1, color: C.ink, letterSpacing: 1.5, textTransform: 'uppercase', textShadow: shadow }}>{children}</div>
      {sub && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: '#d9d0f2', marginTop: 10, textShadow: shadow }}>{sub}</div>}
    </div>
  )
}

/** The night's clock, top left: the same stamps the landing uses. */
export const Stamp: React.FC<{ time: string; label: string }> = ({ time, label }) => {
  const k = useIn(4, 200, 20)
  return (
    <div style={{ position: 'absolute', left: 64, top: 26, display: 'flex', alignItems: 'baseline', gap: 16, opacity: k, transform: `translateX(${(1 - k) * -16}px)` }}>
      <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: C.neon, letterSpacing: 1 }}>{time}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: C.ink, letterSpacing: 4, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}
