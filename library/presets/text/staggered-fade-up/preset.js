/* text/staggered-fade-up: the words arrive one after another, rising 22 px out of a 5 px blur while growing from 0.92 to full size.
   Port of HyperFrames registry component staggered-fade-up (motion only: the source's tone colour and word gap belong to the film).
   Source recipe: every word from { opacity 0, offset 22 px, scale 0.92, blur 5 px } to rest, 0.3 s, stagger 0.055 s, power3.out.
   Variable "direction" (up | down | left | right) points the offset: up starts below and rises, down starts above and drops,
   left starts at the left and slides right, right starts at the right. Variable "distance" (close 0.5 | standard 1 | far 1.85) scales it: param `reach`.
   The stagger runs across every word of every target. */
AIMK.preset("text/staggered-fade-up", {
  params: { duration: 0.3, stagger: 0.055, offset: 22, reach: 1, direction: "up", scale: 0.92, blur: 5, ease: "power3.out" },
  build(tl, els, p, ctx) {
    const d = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] }[p.direction] || [0, 1], o = p.offset * p.reach;
    let k = 0;
    for (const el of els) {
      for (const u of ctx.split(el, "words")) {
        tl.fromTo(u, { opacity: 0, x: d[0] * o, y: d[1] * o, scale: p.scale, filter: `blur(${p.blur}px)` }, { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: p.duration, ease: p.ease }, p.at + k * p.stagger);
        k++;
      }
    }
  },
});
