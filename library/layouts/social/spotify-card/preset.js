/* social/spotify-card: a frosted-glass "now playing" card: big square cover, track name, artist and a small player label with a glyph. The card rises 60 px while scaling
   0.94 -> 1, the texts follow one by one, the cover breathes once (1.015x there and back over 3 s), then the card lifts 40 px and fades out.
   Port of HyperFrames registry block spotify-card. BLOCK: built centred in the target box (source: a 1080 x 1920 composition; the card is 780 px wide and about 990 px tall, so it
   also fits a 1920 x 1080 film; `scale` resizes it). Source timing kept (relative to `at`): card 0.7 s power3.out at 0.1 s; track 0.5 s at 0.55 s; artist 0.45 s at 0.7 s;
   label 0.4 s at 0.85 s (all power2.out); cover breathe 1.5 s power1.inOut yoyo at 1.2 s; out 0.5 s power2.in at exitAt (4.2 s; null = no exit).
   The source's own artwork is the default (05/10/2026): the green cover gradient, the platform logo glyph and the brand name text ("Spotify"); pass `art`, `image` or `brand` to use your own. */
AIMK.preset("social/spotify-card", {
  params: { track: "Tên bài hát", artist: "Tên nghệ sĩ", brand: "Spotify", image: "", art: "linear-gradient(145deg, #1db954 0%, #17a34a 30%, #0f7234 60%, #191414 100%)", scale: 1, exitAt: 4.2 },
  build(tl, els, p, ctx) {
    const t = p.at, s = Number(p.scale) > 0 ? Number(p.scale) : 1;
    ctx.css("social/spotify-card", `
.ssp-box { position: absolute; display: grid; place-items: center; overflow: hidden; }
.ssp-fit { transform-origin: 50% 50%; }
.ssp-card { position: relative; width: 780px; box-sizing: border-box; padding: 36px; border-radius: 28px; overflow: hidden; border: 1px solid rgba(255,255,255,0.22);
  background: linear-gradient(165deg, rgba(140,155,170,0.42) 0%, rgba(100,115,130,0.35) 30%, rgba(75,88,105,0.38) 60%, rgba(60,72,88,0.44) 100%);
  box-shadow: 0 24px 48px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.12);
  backdrop-filter: blur(40px) saturate(180%); -webkit-backdrop-filter: blur(40px) saturate(180%); }
.ssp-spec { position: absolute; left: 0; right: 0; top: 0; height: 55%; border-radius: 28px 28px 0 0; pointer-events: none; background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 35%, transparent 100%); }
.ssp-rim { position: absolute; left: 20px; right: 20px; bottom: 0; height: 1px; pointer-events: none; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 70%, transparent 100%); }
.ssp-art { position: relative; z-index: 1; width: 708px; height: 708px; border-radius: 16px; overflow: hidden; margin-bottom: 36px; }
.ssp-art img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; }
.ssp-note { position: absolute; left: 50%; top: 50%; margin: -100px 0 0 -100px; opacity: 0.2; }
.ssp-info { position: relative; z-index: 1; margin-bottom: 28px; padding: 0 8px; }
.ssp-track { font-size: 52px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 8px; }
.ssp-artist { font-size: 34px; font-weight: 400; color: rgba(255,255,255,0.7); line-height: 1.3; }
.ssp-brand { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; padding: 0 8px; }
.ssp-brandtext { font-size: 26px; font-weight: 600; color: rgba(255,255,255,0.55); letter-spacing: 0.01em; }`);
    for (const slot of els) {
      const W = slot.offsetWidth || ctx.W, H = slot.offsetHeight || ctx.H;
      const box = ctx.make(slot, "div", "sc", { cls: "ssp-box", style: { left: "0px", top: "0px", width: W + "px", height: H + "px" } });
      const fit = ctx.make(box, "div", "fit", { cls: "ssp-fit", style: { transform: `scale(${s})` } });
      const card = ctx.make(fit, "div", "card", { cls: "ssp-card" });
      ctx.make(card, "div", "spec", { cls: "ssp-spec" });
      const art = ctx.make(card, "div", "art", { cls: "ssp-art", style: { background: p.art } });
      if (p.image) ctx.make(art, "img", "img", { attrs: { src: p.image, alt: "" } });
      else ctx.make(art, "div", "note", { cls: "ssp-note", html: `<svg width="200" height="200" viewBox="0 0 24 24" fill="none" style="display:block"><path d="M9 18V5l12-2v13" stroke="rgba(255,255,255,0.7)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="rgba(255,255,255,0.7)" stroke-width="1"/><circle cx="18" cy="16" r="3" stroke="rgba(255,255,255,0.7)" stroke-width="1"/></svg>` });
      const info = ctx.make(card, "div", "info", { cls: "ssp-info" });
      const track = ctx.make(info, "div", "track", { cls: "ssp-track", text: p.track });
      const artist = ctx.make(info, "div", "artist", { cls: "ssp-artist", text: p.artist });
      const brand = ctx.make(card, "div", "brand", { cls: "ssp-brand" });
      ctx.make(brand, "div", "glyph", { html: `<svg width="32" height="32" viewBox="0 0 16 16" fill="rgba(255,255,255,0.55)" style="display:block"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/></svg>` });   // the source's own logo glyph
      ctx.make(brand, "span", "bt", { cls: "ssp-brandtext", text: p.brand });
      ctx.make(card, "div", "rim", { cls: "ssp-rim" });
      tl.fromTo(card, { y: 60, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, t + 0.1);
      tl.fromTo(track, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, t + 0.55);
      tl.fromTo(artist, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, t + 0.7);
      tl.fromTo(brand, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, t + 0.85);
      tl.fromTo(art, { scale: 1 }, { scale: 1.015, duration: 1.5, ease: "power1.inOut", yoyo: true, repeat: 1 }, t + 1.2);
      if (p.exitAt != null) tl.fromTo(card, { y: 0, opacity: 1, scale: 1 }, { y: -40, opacity: 0, scale: 0.96, duration: 0.5, ease: "power2.in", immediateRender: false }, t + p.exitAt);
    }
  },
});
