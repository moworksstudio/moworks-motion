# Thư viện chuyển động

- **Xem:** chạy `gallery.bat` ở gốc kit. Mỗi mẫu có clip xem trước, kết quả kiểm tự động và nút **COPY** sao chép một dòng brief, ví dụ
  `Dùng hiệu ứng thư viện "text/mask-rise" (Chữ trồi lên khỏi mặt nạ)`, để dán vào cuộc trò chuyện.
- **Dùng trong phim:** mỗi mục `"motion"` của `film.json` gọi preset theo tên, ví dụ `"preset": "text/per-word-rise"`. `kit.py build` ghi
  chuyển động thẳng vào `index.html`.
- **Nguồn và giấy phép** của từng mẫu nằm trong `preset.json` của mẫu đó; tổng hợp trong [THIRD-PARTY.md](../docs/THIRD-PARTY.md).
- Gói brand không thuộc thư viện: chúng nằm trong `brands\` (chỉ lưu trên máy). Layout dựng sẵn: [layouts/README.md](layouts/README.md).

---

## Preset format

For anyone who writes or ports a preset. One folder per preset: `presets/<group>/<name>/preset.js` + `preset.json`.

| Group | Contents |
|---|---|
| `text` | Text effects |
| `data` | Numbers and charts |
| `transition` | Scene changes |
| `lower` | Lower thirds and supers |
| `logo` | Logo stings, end tags, CTAs |
| `background` | Backgrounds and ambient full-frame layers |
| `line`, `shape` | Lines, strokes, shapes and pops |
| `motion` | Moves, springs, image sequences, anime.js |
| `effect` | Grain, glitch and other picture effects |
| `hand` | Hand-drawn look: boil, shake, pencil, paper, watercolour |
| `ui` | Small interface elements |
| `intake` | Presets that animate a client's PSD or deck as delivered |
| `character` | Character sheets on the library rig |
| `house` | Moworks house style |

### preset.js

```js
AIMK.preset("<group>/<name>", { params: { ...defaults },
  build(tl, els, p, ctx) { /* p = params merged with the call's params, plus p.at (absolute start time, seconds) */ } });
```

- An **effect** animates the target elements given in `film.json` (a text, a box, a picture).
- A **block** builds its own elements inside the target (an empty box, often the whole frame): lower thirds, logo stings, charts,
  backgrounds. Create elements with `ctx.make(parent, tag, name, { cls, text, html, style, attrs })` (every element gets an id) and add CSS
  with `ctx.css("<group>/<name>", cssText)`, scoping class names with a short prefix.

### Rules

The builder reads the timeline back and writes literal `tl.fromTo / to / set` lines, so:

- **Tweens:** use `tl.fromTo`, `tl.to` and `tl.set` on elements with ids; prefer `fromTo` so the start state is explicit. `stagger` is a
  number or a plain object. `ctx.code` tweens do not count toward a scene's automatic duration: give the demo a `duration` when the motion
  is code only.
- **Eases** are strings. A function ease from a source goes through `ctx.ease(fn, label)`, which fits it to one cubic Bézier
  (`custom(M0,0 C ...)`); the Gallery reports the fit error.
- **Determinism:** no `Math.random`, `Date`, `performance.now` or `requestAnimationFrame`. For per-element variation use `ctx.hash(el |
  string)` (stable, 0..1).
- **No network:** no CDN, web fonts or remote images. Text uses the film's font unless a font file is in the project; monospace text uses
  `"RMono"` (Roboto Mono, Vietnamese complete).
- **Per-frame motion** (counters, scramble, noise) goes through `ctx.code(js)`: the code is copied into the film in its own block, sees
  `tl` and `gsap`, uses absolute times (`${p.at}`) and `document.getElementById`, and must be a pure function of time (a proxy tween with
  `onUpdate`).
- **Pictures that change:** code that swaps an `<img>` pushes its `img.decode()` promise into `window.__aimkSeekWaits`, so no capture shows
  the previous picture (`motion/image-sequence` is the example).
- **Sizes:** source sizes in `cqw` / `cqh` / `vw` / `vh` become px from `ctx.W` / `ctx.H`; keep source px values as they are.
- **Sound:** `ctx.sfx(t, name, gain)` places one of the kit's sound effects (swoosh, whoosh, pop, sparkle, tick, tickhi, thump) at time
  `t`.
- **Springs:** `ctx.track(el, prop, [[t, value, spring?], ...], spring, at)` moves a property as a sum of springs; tween eases
  `spring.snappy | default | heavy | playful` and `springk(k, d)` live in `engine/vendor/libs/aimk/eases.js`.
- **Helpers:** `ctx.split(el, "words" | "chars")` returns spans with ids; `ctx.mask(el)` gives an overflow box with an 18 % pad so
  diacritics are not cut; `ctx.layer(el)` adds an inner wrapper as a second transform owner (ambient motion on top of an entrance).
- **Faithful port:** same timings, distances, eases, order and colours as the source; change only what these rules force and say what
  changed in `preset.json` `notes`. Assets that ship with an open-source source are kept in the preset's `assets/`.

**Common pitfalls (each one caught by the Gallery check):**
- A tweened string (text-shadow, filter, clip-path, gradient) must have the same structure at both ends; pad the short end with
  transparent, zero-offset entries.
- Round computed values to 4 decimals (the builder writes 4).
- A later tween must start where the element already is; a jump is its own `tl.set` before the tween. Prefer `fromTo` over `to` after a
  set: the player seeks in both directions.
- Vietnamese capitals stack marks above line-height 1: a `clip-path: inset(...)` or `background-clip: text` needs room above and below
  (e.g. `inset(-0.4em ... -0.3em ...)`).

### preset.json

```json
{
 "name": "<group>/<name>", "kind": "effect" | "block", "group": "<group>",
 "title": "English title", "title_vi": "Tên tiếng Việt ngắn", "desc_vi": "Một câu mô tả chuyển động",
 "params_vi": "Tham số chính, giải thích ngắn",
 "source": { "label": "HyperFrames registry", "repo": "heygen-com/hyperframes", "commit": "<sha>", "path": "registry/.../file.html" },
 "license": "Apache-2.0",
 "ae": "keyframes" | "expression" | "png" | "footage+timeremap",
 "brand_safe": false,
 "tags": ["..."],
 "notes": "what differs from the source and why",
 "demo": { "bg": "#111216", "duration": "auto" | 4, "hold": 1.0, "elements": [...], "motion": [{ "target": "t1", "at": 0.3, "params": {} }], "scenes": [...] }
}
```

| Key | Meaning |
|---|---|
| `ae` | How the preset reaches After Effects: `keyframes` (literal tweens), `expression` (`ctx.code`), `png` (rendered layer: filters, canvas), `footage+timeremap` |
| `brand_safe` | `true` when the preset never distorts what a strict guideline protects (no glitch, stretch, blur trail, split or mirror on its target); the Gallery tags it "hợp guideline". `null` = not judged |
| `demo` | Optional. Defaults: `text` = one Vietnamese headline `t1`; `block` = a full-frame `slot`. Demo text is Vietnamese with diacritics; a transition demo gives two `scenes`, the second with `"transition_in"` |
| `demo.thumb_at` | Where the Gallery thumbnail is taken, as a share of the demo (default 0.82) |
| `demo.seek_tolerance` | Share of pixels two seeks to the same time may differ by (default 0.0002), for the paint noise of an as-shipped component |
| `demo.skip` | `true`: no Gallery clip (the preset needs a project's own file) |
| `check_end` | Default `true` for text effects: the last demo frame must match the layout exactly |
| `incoming`, `kept` | Dates written by `kit.py library import` and the Gallery's Keep button |

### Checks

```bash
python engine/kit.py gallery build <name filter>
```

Results go to `gallery/checks/<group>__<name>.json`: `build` (the preset bakes), `seek` (same pixels after jumping), `bake` (the
written-out film equals the live preset), `end` (text lands exactly on the layout, no clipped marks), `static` (no forbidden calls),
`ease_fit`, `blank` (something is drawn). `status` must be `ok`, or `warn` with the reason in `notes`.

### HyperFrames items run as shipped

About 250 layouts run HyperFrames registry code unchanged instead of a re-written preset:

- **Template components** (`ctx.hf`, `engine/vendor/libs/hf/hf-mount.js`): the `<template>` content is mounted into the target box with its
  own ids, variables and timeline. Params are the component's variables plus `duration`, `theme` (CSS variables) and `slots` (the project's
  own content). Generated by `engine/tests/hf_templates.py`.
- **Blocks and demo pages** (`ctx.hfFrame`, `engine/vendor/libs/hf/hf-frame.js`): the page runs in an iframe scaled to the box, its
  timeline following the film's time. Params are the page's variables, `duration`, `replace` (text pairs applied before it runs) and
  `images`. `hf-frame.js` provides the HyperFrames runtime the page expects (variables, asset URLs, build-ready promises, clip visibility,
  three.js / Lottie / video seeking). Generated by `engine/tests/hf_blocks.py`.

Both kinds reach After Effects as rendered pictures, except text, which becomes text layers. Items not in the library are listed in
[KNOWN-ISSUES.md](../docs/KNOWN-ISSUES.md) (KI-05).

### The character rig

`engine/vendor/libs/aimk/rig.js` (`window.AIMK_RIG`) draws rigged flat-vector people, hands and drawn art as HTML joints holding one
`<svg>` per part (each part an AE layer; plain parts port as shape layers). A preset that uses it lists `"scripts": ["libs/aimk/rig.js"]`.
A film's own looks live in `<film>/03_HTML/presets/cast/<name>/`, its redrawn art and puppets in `<film>/03_HTML/presets/drawn/<name>/`
(`AIMK_RIG.art`, `AIMK_RIG.puppet`, checked by `kit.py sheet <film> --puppets`). Animation helpers: `AIMK_RIG.anim(tl, p.at)` (poses,
expressions, blinks, talking, hand swaps, walks). Workflow: `engine/skill/moworks-motion/workflow/characters.md`.

## Presets that belong to one film

Motion written for one project lives in `<film>/03_HTML/presets/<group>/<name>/` (same format); `kit.py build` looks there first. A preset
enters `library/` only through the Gallery's "Mới nhập" review.

## Practical notes

- A 90° hinge is invisible only when the perspective origin sits on the hinge.
- `backface-visibility: hidden` is not reliable in renders: fold to 90° and hide the element.
- A first `fromTo` draws its "from" state at once (immediateRender): hide an element until its time if its start state is visible.
- Never blend two frames of an image sequence; snap the frame to the film's 60 fps grid.
- Text inside a scaled-up `will-change: transform` element renders soft (`kit.py verify` warns).
