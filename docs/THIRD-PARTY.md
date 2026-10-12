# Third-party code and assets

Every component that Moworks Motion ships or adapts from outside, with its licence. Each library preset's `preset.json` records its exact
source (repository, commit, path) and licence. Files kept "as shipped" carry SHA-256 checksums in a `MANIFEST.json` beside them or in the
preset's `source.sha256`, and the kit verifies them before use.

## Code and libraries

| Component | Version | Licence | Use in the kit |
|---|---|---|---|
| [claude-motion-design](https://github.com/howseen-ai/claude-motion-design) (Howseen AI, Raphaël Aubry) | 2026 | MIT (notice below) | Origin of the kit: films as HTML driven by one `seek(t)`, Playwright frame capture, sub-frame motion blur, sound placed by peak, ffmpeg encoding. Its remake mode (cut detection, measuring on reference frames, split screen, old-colour scan, tempo matching) is re-implemented in `engine/qa/shots.py`, `follow.py`, `compare.py` and `kit.py beats --to-bpm` |
| [GSAP](https://gsap.com) + plugins | 3.15.0 | GSAP Standard License (see below) | Animation runtime of every film (`engine/vendor/gsap`) |
| [anime.js](https://github.com/juliangarnier/anime) (Julian Garnier, animejs.com) | 4.5.0 | MIT (`LICENSE.md` beside it) | As shipped in `engine/vendor/libs/anime/`; driven by the film's clock through `engine/vendor/libs/aimk/anime-sync.js` (kit code) for the `motion/anime` family of presets |
| [HyperFrames](https://github.com/heygen-com/hyperframes) (HeyGen) | 0.8.x, installed on demand | Apache-2.0 | Optional Studio and presentation mode; not vendored |
| HyperFrames registry blocks and components | commits `0ca6947`, `ba08acb` (per item in `preset.json`) | Apache-2.0 | About 250 library layouts run the registry code as shipped (`engine/tests/hf_blocks.py`, `hf_templates.py`); kit-side adjustments are listed in [KNOWN-ISSUES.md](KNOWN-ISSUES.md) |
| HyperFrames skills | commit `ba08acb1f506b06757bd77a7e7f491d412647fbd` | Apache-2.0 | **As shipped:** embedded-captions (`engine/vendor/hf-captions/`, run by `engine/intake/captions.py`, played by `text/embedded-captions`), music-to-video templates and primitives, hyperframes-creative frame presets (`library/looks/`), talking-head-recut design assets, pr-to-video ingest (`engine/vendor/hf-pr/`), motion-graphics locate (`engine/vendor/hf-locate/`). **Re-implemented:** the story method (`workflow/story.md`), slideshow schema, talking-head layouts, the person matte for video, caption plate effects, the `nudge` ease and `transition/push` `hit` |
| HyperFrames bundled sound effects | commit `2905162d925fc87fb8242e24ed0bbf025d307ea1`, `skills/media-use/audio/assets/sfx/` | the sounds: Pixabay Content License (`CREDITS.md`); the repository: Apache-2.0 (`LICENSE` beside them) | As shipped in `engine/vendor/hf-sfx/` (19 sounds, `manifest.json`, `CREDITS.md`; SHA-256 in `CHECKSUMS.json`), decoded into each film by `engine/audio/sfx.py`. Upstream ships `click` = `click-soft` and `whoosh` = `whoosh-short` as identical files |
| HyperFrames voiceover carve | `carve.mjs` at v0.8.147; `@hyperframes/core` 0.8.147 (`dist/audioCarve.js`, `dist/audioFx.js`) | Apache-2.0 | As shipped in `engine/vendor/hf-carve/`, run by `engine/audio/carve.py` |
| Vietnamese faces for the caption fonts | kit-made | SIL OFL 1.1 (from the fonts below) | `engine/vendor/hf-captions-vi/` (`engine/tests/hf_captions_vi.py`): HyperFrames' family and file names, glyphs from OFL families with Vietnamese |
| vtake-skills (leeoxiang) | as adapted in HyperFrames `ba08acb` | MIT (notice below) | Card styles, layouts and frames of `card/talking-card` and `motion/talking-layout` |
| [claude-animation](https://github.com/buildwithhanif/claude-animation-skill) (Hanif, @hanifproduktif) | commit `4ddb8c8` (23/09/2026) | MIT | Drawing core ported to the browser in `engine/vendor/libs/hand/handkit.js` (`hand/paper`, `hand/pencil-draw`, `hand/watercolor`; formulas in `hand/shake`, `hand/comic-text`) |
| [iart-ai motion skills](https://github.com/iart-ai) (iart.ai): `iart-ai/motion-design-skills` 3c129f7, `iart-ai/manim-skills` a15833c, `iart-ai/explainer-video-skills` 3e2d411, `iart-ai/youtube-video-skills` f3df381, `iart-ai/map-animation-skills` 390ca98, `iart-ai/data-animation-skills` 8ce2709, `iart-ai/tiktok-video-skills` 2a77533, `iart-ai/ecommerce-video-skills` 2bd0dd1 | commits of 22/06/2026 | MIT (notice below) | Techniques re-implemented in the kit's own code from their reference notes (repo, commit and file in each `preset.json`): `data/countdown`, `logo/svg-reveal`, `motion/inertial-bounce`, `motion/ken-burns`, `text/math-write`, `background/noise-flow`, `data/audiogram`, `data/function-plot`, `data/iso-stack`, `data/sequence-diagram`, `line/flow-connector`, `map/pin-route`, `text/bullets`, `title/yt-end-screen` |
| [remocn](https://github.com/Remocn/remocn) (Remocn) | `3e03565` (caret-swap), `ea730a2` (kinetic-center-build), through the HyperFrames registry `0ca6947` | MIT (the notice stays in each block's file) | `text/caret-swap`, `text/center-build` |
| three.js | 0.147.0, 0.181.2 and the version under `libs/three` | MIT | 3D presets and layouts (`engine/vendor/libs/three*`) |
| lottie-web | vendored | MIT | Lottie playback |
| d3, topojson-client | d3 7.9.0 | ISC | Charts and maps |
| KaTeX | vendored | MIT | Math typesetting |
| clipper-lib (Angus Johnson) | 6.4.2 | Boost Software License 1.0 | `engine/vendor/libs/clipper-lib/` |
| Playwright | 1.63.0 | Apache-2.0 | Rendering (drives Chromium) |
| faster-whisper, rembg, librosa, scikit-learn | see `engine/requirements.txt` | MIT / MIT / ISC / BSD-3 | Speech-to-text, background removal, beat tracking (installed by `install.bat`) |

## Fonts and data

| Component | Licence | Use in the kit |
|---|---|---|
| Roboto Flex, Roboto Mono | SIL OFL 1.1 | Default fonts (`engine/vendor/fonts`). The fixed optical-size copies for After Effects are renamed "Roboto Flex Opsz<N>" as the OFL requires of modified versions (`engine/vendor/fonts/opsz`) |
| Google Fonts families | SIL OFL 1.1 (`OFL.txt` in each folder) | `engine/vendor/fonts/google/`: Archivo, Newsreader, JetBrains Mono, Inter, Space Grotesk, Lobster, Source Serif 4, Barlow, IBM Plex Mono, Playfair Display, Hanken Grotesk, EB Garamond, Oswald, Baloo 2, Quicksand, Patrick Hand, Anton, Chakra Petch, Saira Condensed, Exo 2, Cormorant Garamond, VT323, Lexend, Sedgwick Ave Display. All include Vietnamese; they also stand in for families without it (e.g. Bebas Neue → Oswald, Fredoka → Baloo 2, Orbitron → Chakra Petch) |
| world-atlas countries-110m | ISC; data from Natural Earth (public domain) | Maps |
| us-atlas states-10m (`us-atlas@3`) | ISC; data from the US Census Bureau (public domain) | `map/us`, `us-bubble`, `us-flow` |
| es-atlas autonomous regions (`es-atlas@0.6.0`) | as published with the npm package; boundaries from Spain's IGN | `map/spain` |

## Media in the library

- Layouts copied from the HyperFrames registry keep the pictures, icons, models and sounds the registry ships with them, as shipped.
- `social/avatar-promo-card` includes HeyGen sample media (avatar clips, background music, logo), `title/glass-shard` a matcap texture,
  and the `text/embedded-captions` demo frames come from one of those avatar clips; all from the registry's public asset store
  (`static.heygen.ai/hyperframes-oss`). They are demo media: a film uses its own footage.
- No music library is bundled (the few sounds inside registry layouts are their own demo media). When a project has no music, the kit
  downloads three free tracks from Mixkit under the [Mixkit Stock Music Free License](https://mixkit.co/license/#musicFree).
- The sound effects are HyperFrames' bundled set from Pixabay (above). Pixabay's licence allows commercial use without attribution but not
  redistributing the files on their own: the kit ships them inside its library as HyperFrames does, and films use them as sound.
- Brand packs (`brands/`) and reference libraries (`library/refs/`) stay on the user's machine and are never committed.

## Techniques and references

Ideas re-written in the kit's own words and code (no code copied):
- "Opus 5.5 Motion Lab" (X article by @flxrnc): motion numbers, banned defaults, reading-time / contrast / bounce lints, onion skin and
  speed graph, sound one frame after its picture, phone-band loudness, linear-light motion blur, GIF timing.
- "Motion design studio with Opus 5.5" (X article by @0xMovez): spring eases and sums of springs (`engine/vendor/libs/aimk/eases.js`,
  `ctx.track`), the self-review loop.
- HyperFrames animation rules (`nudge-curve`, `reactive-displacement`): the `nudge` ease and `transition/push` `hit`.
- "Sound pass" prompt (X post by @Voxyz_ai): recorded sound effects instead of synthesised ones, the kick check under 120 Hz, moving
  where the music starts, -16 LUFS with peaks under -4 dBFS measured on the exported MP4, frames around every cue, five timestamps for
  the user's headphones (`engine/audio/sfx.py`, `beats.py`, `loudness.py`, `media.py`, `workflow/film.md`).

## GSAP Standard License

GSAP is free to use, including for commercial work, under the [GSAP Standard License](https://gsap.com/standard-license). It permits use
in any website, web application or digital interface, and prohibits use in tools that let users create animations through a visual,
no-code builder in competition with Webflow. The GSAP files keep their original headers. GSAP is not open-source software; anyone
redistributing Moworks Motion should read the licence.

## claude-motion-design: MIT licence notice

```
MIT License

Copyright (c) 2026 Howseen AI (Raphaël Aubry)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## vtake-skills: MIT licence notice

```
MIT License

Copyright (c) 2026 leeoxiang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## iart.ai motion skills: MIT licence notice

```
MIT License

Copyright (c) 2026 iart.ai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
