/* text/lyric-line: one sung line, word by word: the line's words are split (ctx.split) and each lands on its own sung time with one of
   text/land-in's entrances (copied here: this preset stands alone). Times come from kit.py align (the song's words) or by hand, as
   seconds from the motion's "at". A word with no time in the list lands right after the one before. Written for a studio lyric film
   (08/10/2026). params: times [s, ...] (one per word), style (rise, stomp, stompS, pop, steps, stepsup, fade, flip, zoom), stagger
   (s between words with no time) */
AIMK.preset("text/lyric-line", { params: { times: [], style: "rise", stagger: 0.18 },
  build(tl, els, p, ctx) {
    const S = { rise: [-0.04, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1 }, 0.2, "expo.out"],
      stomp: [-0.06, { scale: 1.9, opacity: 0 }, { scale: 1, opacity: 1 }, 0.22, "expo.out"],
      stompS: [-0.05, { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1 }, 0.18, "expo.out"],
      pop: [-0.06, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }, 0.36, "back.out(2.2)"],
      steps: [-0.03, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1 }, 0.2, "steps(4)"],
      stepsup: [-0.03, { y: 90, opacity: 0 }, { y: 0, opacity: 1 }, 0.2, "steps(4)"],
      fade: [-0.02, { opacity: 0 }, { opacity: 1 }, 0.12, "power1.out"],
      flip: [-0.08, { rotationX: -95, opacity: 0, transformPerspective: 900, transformOrigin: "50% 100%" }, { rotationX: 0, opacity: 1 }, 0.26, "back.out(1.5)"],
      zoom: [-0.05, { scale: 0.12, opacity: 0 }, { scale: 1, opacity: 1 }, 0.24, "expo.out"] };
    const s = S[p.style];
    if (!s) throw new Error(`text/lyric-line: style "${p.style}"? one of ${Object.keys(S).join(", ")}`);
    const [lead, frm, to, d, ease] = s;
    for (const el of els) {
      const ws = ctx.split(el, "words");
      let last = -p.stagger;
      ws.forEach((w, i) => {
        const t = p.times[i] != null ? +p.times[i] : last + p.stagger; last = t;
        tl.fromTo(w, Object.assign({}, frm), Object.assign({}, to, { duration: d, ease }), Math.max(0, +(p.at + t + lead).toFixed(4)));
      });
    }
  } });
