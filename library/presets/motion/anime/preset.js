/* motion/anime: any anime.js animation written straight in film.json (anime.js 4.5.0, engine/vendor/libs/anime, MIT, as shipped), on the
   film's clock through engine/vendor/libs/aimk/anime-sync.js (seekable frame by frame, seeded, the AE port reads what it draws). The anime.js
   counterpart of motion/tween: its stagger (grids measured from the elements' real places, jitter with a seed, a spring spread), splitText
   (lines / words / chars, clip wraps, clones for rolls), scrambleText, SVG morphTo / createDrawable / createMotionPath, spring / irregular /
   steps / linear eases, keyframes, timelines and layout changes (FLIP on anime.js) (12/10/2026, the user: "dùng hết nếu được").
   params:
     targets  "self" | "chars" | "words" | "lines" (after split) | a CSS selector inside the target
     split    null | anime.js splitText options, e.g. { "chars": { "wrap": "clip", "clone": "bottom" } } (made at build time: part of the film)
     anim     anime.js parameters + the kit's JSON forms (engine/vendor/libs/aimk/anime-sync.js header): e.g.
              { "y": ["100%", "0%"], "duration": 0.6, "ease": "outExpo", "delay": { "stagger": 0.04, "from": "center" } }
     timeline null | [{ "targets": ..., ...anim, "position": "<<+=0.1" }]   (several animations in one anime.js timeline; defaults: "defaults")
     layout   null | { "changes": [{ "sel": "#a", "append": "#row" }, { "sel": "#row", "style": { "flexDirection": "column" } }], "spec": { "duration": 0.8 } }
     seed     the random seed (stagger "random", irregular, jitter); window: seconds the film drives it (default its own length)
   Times are seconds (anime.js's time unit is set to seconds). */
AIMK.preset("motion/anime", { params: { targets: "self", split: null, anim: { opacity: [0, 1], y: [40, 0], duration: 0.8, ease: "outExpo" },
                                        timeline: null, defaults: null, layout: null, seed: 1, window: null },
  build(tl, els, p, ctx) {
    const J = v => JSON.stringify(v == null ? null : v).replace(/</g, "\\u003c");
    for (const el of els) {
      ctx.id(el, "an");
      if (p.split) AIMKAnime.split(el, p.split);
      const base = "#" + CSS.escape(el.id);
      const sel = t => !t || t === "self" ? base : t === "chars" ? base + " [data-char]" : t === "words" ? base + " [data-word]"
        : t === "lines" ? base + " [data-line]" : base + " " + t;
      const win = p.window == null ? "null" : +p.window;
      if (p.layout)
        ctx.code(`  // motion/anime ${base}: a layout change (FLIP on anime.js) on the film's clock
  AIMKAnime.layout(tl, ${p.at}, ${J(base)}, ${J(p.layout.changes || [])}, ${J(p.layout.spec || {})}, ${+p.seed || 1}, ${win});`);
      else if (p.timeline)
        ctx.code(`  // motion/anime ${base}: an anime.js timeline on the film's clock
  AIMKAnime.timeline(tl, ${p.at}, ${J(p.timeline.map(it => Object.assign({}, it, { targets: sel(it.targets) })))}, ${J(p.defaults || {})}, ${+p.seed || 1}, ${win});`);
      else
        ctx.code(`  // motion/anime ${base}: one anime.js animation on the film's clock
  AIMKAnime.animate(tl, ${p.at}, ${J(sel(p.targets))}, ${J(p.anim)}, ${+p.seed || 1}, ${win});`);
    }
  },
});
