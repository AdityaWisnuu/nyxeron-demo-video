# NYXERON demo video (internal)

The source of the hackathon demo video "One night, two people" (1:42, 1080p). Internal only, not part of the submission.

Made with [Remotion](https://remotion.dev) (React → video). Every scene is a real recording of app.nyxeron.xyz on NEAR testnet.

## Run

```sh
npm install
npx remotion studio            # live preview + timeline, edit and watch
npx remotion render src/index.ts Film out/nyxeron-one-night.mp4 --crf=18
```

Node 20+. A full render takes ~15 min on an M-series Mac.

## Where things are

| Path | What |
|---|---|
| `src/Film.tsx` | The whole film: shot list per scene (`COLD`, `MAYA`, `RIO_IN`, `RIO_PARTY`, `TX`, `PROOF`), the running order (`parts`), captions, voice-over cues, music mix |
| `src/kit.tsx` | Building blocks: `Screen` (a recording with an eased camera: `cams` = time/focus/zoom keys, `marks` = gold highlight rings), `Caption`, `Stamp` (the clock), `Backdrop` |
| `src/toons.tsx` | Drawn scenes: `Split` (where the money goes), `EndCard`, plus older ones |
| `public/clips/` | The recordings, trimmed to what the film uses (1920×1080) |
| `public/vo/` | Voice-over lines (ElevenLabs v4, voice "Jessica"), loudness-normalised to −14 LUFS |
| `public/audio/` | Music bed (Papi Jarang Pulang from the game's crate): `track-n` normal, `track-duck` mid-scooped (under the voice), `track-muffled` (the twist) |
| `recorder/` | The Playwright scripts used to record the app with a visible cursor (`recw.mjs` + `runw.sh`; `vt.mjs` for frame-exact captures). They need `npm i playwright-core` and Chrome |

## Common edits

- **Change a caption:** find it in `parts` in `src/Film.tsx` (`<Caption from to sub>`; times in seconds from the scene start).
- **Move a camera:** edit that shot's `cams` (`t` seconds, `x`/`y` focus in screen pixels, `z` zoom).
- **Swap a voice line:** drop a new mp3 in `public/vo/`, update its id and length in `VOLEN`, and the cue in the scene's `vo` list.
- **Music level:** `base`, and the `0.22` factor on `track-duck` in `Film`.

The voice lines' script is in the `vo` cues; the two test accounts in the recordings are testnet only.
