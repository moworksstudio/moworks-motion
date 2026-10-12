# Thư viện layout

Các mẫu thiết kế dựng sẵn: khung thiết bị, kính iOS, card, giao diện ứng dụng, thẻ mạng xã hội, tiêu đề, carousel. Claude dùng chúng khi
thiết kế mới, hoặc khi bạn chỉ định một mẫu. Xem trong `gallery.bat`, mục **Thư viện layout**. Định dạng giống thư viện chuyển động
([library/README.md](../README.md)), cộng các quy tắc dưới đây.

---

## Rules for layout presets

**Location and format**
- Path: `library/layouts/<group>/<name>/preset.js` + `preset.json`; `kind` is always `"block"`.

| Group | Contents |
|---|---|
| `device` | Phone, laptop, tablet frames and stages |
| `glass` | Liquid-glass UI |
| `ui`, `flow` | App screens, chat, notifications, sheets; signup, settings, onboarding, tabs |
| `card`, `social` | Testimonial, proof, spotlight cards; post and follow cards |
| `title` | Title cards and CTAs |
| `compare` | Before / after, split |
| `code` | Terminals, editors |
| `carousel` | Image rows and rings |
| `data`, `map` | Charts, counters, maps |
| `transition`, `camera`, `cursor`, `effect`, `text`, `hand`, `line`, `logo`, `motion`, `background` | Full-frame HyperFrames blocks by purpose |

**Content goes in through params**
- Every text, number, colour and image is a param with a Vietnamese default. When the source's copy belongs to its own artwork (app names
  under real icons, a real product's interface), the source's English copy stays as the default.
- An image param defaults to a neutral picture from `library/gallery/demo-assets/` or the preset's own `assets/`.
- Layouts are templates: the film fills them with the project's content.

**Files**
- Libraries, models and textures go in the preset's `assets/`, referenced with `ctx.asset("file")`; `kit.py build` copies them into the
  film.
- No network (no CDN, Google Fonts or remote decoders). Libraries the kit already ships are in `engine/vendor` (GSAP, three.js, d3, Lottie,
  topojson, KaTeX, anime.js); list them in `preset.json` `"scripts"` in load order. A source that needs a library the kit does not have is
  reported rather than downloaded.
- Assets that ship with an open-source source (logos, icons, pictures, models) are kept as shipped. `"brand_ui": true` marks layouts that
  look like a real product (an X post, an iOS home screen).

**Motion**
- Keep the source's motion (entrances, loops).
- Animation that must run every frame (WebGL, canvas) goes through `ctx.code` and must be a pure function of time.
- `"needs"` lists what the layout requires (e.g. `["webgl"]`); such layouts reach After Effects as PNG sequences (`"ae": "png"`).
