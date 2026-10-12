# Intake: kajisho5/ffmpeg-skill

- **Read:** 2026-10-12, commit `f62e7d0be9e1e442734034fca035852427401c4a` (v2.8.6), https://github.com/kajisho5/ffmpeg-skill
- **Licence:** MIT (`LICENSE`, © 2026 kajisho5) · assets: none taken (the demo GIFs in `docs/demos/` are made by `demos/build.py` from
  synthetic footage; `assets/logo.png`, `icon.png` are the project's own branding; the real-device test corpus is downloaded at test time,
  not shipped)
- **What it is:** an Agent Skill (`SKILL.md`) and 42 Python 3.9 standard-library command-line tools around `ffmpeg` / `ffprobe` for
  editing footage and audio that already exist: cut, join, silence removal, fit to an aspect or a length, burnt-in captions, overlays,
  HDR → SDR, LUTs, audio clean-up, sync, multicam, loudness, platform exports and delivery checks, plus an MCP server and a
  machine-readable contract. One maintainer plus bots; 370 commits between 2026-09-03 and 2026-10-12.

## Tóm tắt cho người dùng

Repo này là bộ **dựng footage có sẵn** (cắt, ghép, phụ đề burn-in, xuất cho từng nền tảng), không phải bộ làm motion graphic. Kit đã có
phần lớn những gì liên quan tới phim (loudness, beat, cắt cảnh, GIF, phụ đề động, audiogram) và làm tốt hơn cho phim. Ba thứ nên học:

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | Kiểm footage trước khi dùng: HDR (PQ / HLG / Dolby Vision), tốc độ khung không đều (VFR), xoay dọc, video Log; chuyển HDR → SDR BT.709 (`zscale` + `tonemap`) | Một bước chuẩn bị footage dùng chung: chạy trong `kit.py cutout <video>` trước khi tách khung, và `kit.py build` / `lint` cảnh báo video chưa chuẩn bị trong film.json. Tên lệnh để phiên desktop chọn (gợi ý: `kit.py ingest <project> <clip>`) | MIT | cao | 5–7 giờ | viết lại (ý và chuỗi filter của `color.py`, `_common/probe.py`) |
| 2 | Vùng an toàn theo nền tảng (TikTok / Reels / Shorts che trên, dưới, cột phải) + bảng kiểm file xuất (độ dài, khổ, fps, codec, `yuv420p`, dung lượng, LUFS, true peak) | film.json `"platform"`; `kit.py lint` báo chữ / logo nằm trong vùng bị che; `kit.py stills --phone` tô vùng bị che; `kit.py mp4 --platform <tên>` kiểm file vừa xuất | MIT | vừa | 4–6 giờ | viết lại (số liệu cần kiểm lại: không có nguồn chính thức) |
| 3 | Kinh nghiệm thực tế về footage (iPhone HDR + VFR + xoay, GoPro 10-bit nhưng không phải HDR, DJI không tiếng, quay màn hình VFR, Log trông xám, 60 → 30 fps mất nửa chuyển động) | Skill: `workflow/recipes.md` mục 6 (talking head) hoặc `film.md` | MIT | vừa | 1 giờ | viết lại thành luật của skill |
| 4 | Chống rung (`vidstab`), áp LUT cho video Log, khử nhiễu | Tuỳ chọn của bước #1 | MIT | thấp | 2 giờ | để sau, khi có job cần |
| 5 | Cắt / ghép / bỏ khoảng lặng / phụ đề burn-in / lower third bằng drawtext / multicam / xuất timeline cho Premiere / MCP | — | MIT | thấp | — | không lấy (việc của phần mềm dựng; bản HTML của kit đẹp hơn) |

**Kết luận:** Không nhập repo này vào kit. Nên làm #1 trước (rủi ro thật cho phim talking head quay bằng iPhone), rồi #2 và #3. Studio
có job chỉ cắt / ghép footage, không có motion: có thể cài riêng skill này (`npx ffmpeg-skill`); nó chạy độc lập, không đụng tới kit.

## Already in the kit

| ffmpeg-skill | Kit | Better one, and why |
|---|---|---|
| `loudness.py` (two-pass `loudnorm`, re-measure the written file) | `kit.py loudness` (two-pass `loudnorm` to -16 LUFS / -4 dBTP; measures the exported MP4, its mono fold-down, the 200 Hz – 6 kHz phone band, each effect over the bed, cue sheets) | Kit: it measures the film as heard, not only the file's level |
| `audio.py --music --duck` (sidechain compressor) | `engine/audio/media.py` ducking to 25 % under the voice; `carve` (HyperFrames) cuts only the voice band out of the music | Kit (carve) |
| `scenes.py --beats` (pure-Python autocorrelation) | `kit.py beats` (librosa, kick check under 120 Hz, tempo candidates, `--fit`) | Kit |
| `scenes.py` hard cuts, `--shots` static / pan / motion label | `kit.py compare --shots` (cuts, sheets every 0.25 s, sound), `--follow` (eases, distances per native frame) | Kit for a remake; the static / pan / motion label is a small extra not worth a port |
| `look.py` contact sheets, side by side | `kit.py stills`, `compare`, `--split` | Kit (film-aware) except the platform overlay (row 2 above) |
| `export.py --preset gif` | `kit.py mp4 --gif` (one palette, exact 40 / 50 ms delays so the loop stays on the beat) | Kit |
| `caption.py --animate pop --karaoke` (libass burn-in) | `text/caption-*` presets, `text/embedded-captions` (35 HyperFrames styles), word times from `kit.py transcribe` | Kit: HTML captions animate freely and port to AE as text layers |
| `graphics.py` lower thirds, title cards, progress bars (drawtext) | `lower/*` (13), `logo/*`, `data/*`, layouts | Kit |
| `waveform.py` audiogram (`showwaves`) | `library/layouts/data/audiogram`, `data/oscilloscope` | Kit |
| `check.py --content` black / frozen / silent spans | `kit.py qa` (pops, one-frame flashes, still time, photosensitivity), lint blank frames after cuts, loudness "cuts with no sound" | Kit |
| `doctor` (ffmpeg filters / encoders present) | `kit.py doctor` | Kit's ffmpeg is fixed (below), so per-filter detection matters less |

The kit's ffmpeg was checked for this report: `imageio-ffmpeg 0.6.0` (the version in `engine/toolchain.json`) ships
`ffmpeg-win-x86_64-v7.1.exe`, built with `--enable-libzimg` (zscale), `--enable-libvidstab`, `--enable-libass`, `--enable-libx265`,
`--enable-librubberband` and others. So the filters rows 1 and 4 need are in the kit already. The wheel carries **no `ffprobe`**: the kit
reads media facts from `ffmpeg -i` output (`engine/audio/media.py` `probe`), and only `kit.py measure --locate` and
`cutout --captions` ask for a separate FFmpeg on PATH.

## Not taken, and why

- **The tools as shipped.** Every script depends on the shared `scripts/_common/` layer (runner, emit, decision, probe: about 4,400 lines)
  and on `ffprobe`, which the kit's bundled ffmpeg lacks; their output conventions (JSON contract, `Done:` / `Failed:` reports in English
  labels) differ from the kit's. The pieces worth having are a few dozen lines each (a probe parse, one filter chain, one table). A kit
  re-write is shorter and keeps one way of calling ffmpeg. This is the stated reason for re-writing rather than copying.
- **Cut, join, silence and filler removal, speed ramps, B-roll, multicam, `render.py` projects, `--export-timeline` (FCPXML / EDL /
  OTIO).** Editing footage belongs in the editor's NLE; the kit makes graphics and films from `film.json`. Not in the film model.
- **`sync.py` (audio cross-correlation, drift).** Useful when a talking head comes with a separate microphone, but rare for the studio; the
  kit already has numpy and `compare --offset` for a reference. Revisit if such a job appears.
- **Burnt-in captions and drawtext graphics.** Lower quality than the kit's HTML presets, and they do not port to After Effects as
  editable layers.
- **MCP server, contract, `npx` installer, CI scripts, `.claude/skills/` (developer process skills).** Packaging for an agent ecosystem
  the kit does not need.
- **Their skill-eval method** (trigger prompts plus agent runs graded by a second model, `evals/`). A good idea for testing the
  moworks-motion skill's routing, but it costs many agent runs; noted here, not proposed.

## Risks and open questions

1. **HDR footage today (to confirm on the Windows machine).** `engine/intake/cutout.py:38` turns a clip into PNG frames with
   `ffmpeg -vf fps=N` and no colour handling. An iPhone clip shot in HDR (HLG or Dolby Vision, 10-bit HEVC) converted that way is
   expected to come out flat and washed out, because nothing maps BT.2020 / HLG to BT.709. Test with one real iPhone HDR clip before
   building row 1: frames from `cutout` beside the same moment tone-mapped with the chain below.
2. **What the kit's Chromium plays.** Footage inside a film plays in a `<video>` element (`motion/talking-layout`, HyperFrames frames).
   Whether Playwright's Chromium on Windows decodes HEVC, Dolby Vision or ProRes, and how it shows HDR, was not tested here. A footage step
   that always writes an SDR H.264 copy at a constant frame rate removes the question; the desktop session decides whether to measure
   first.
3. **Variable frame rate in remake references.** `engine/qa/shots.py` reads the reference's fps from the ffmpeg banner and numbers
   frames from it. A phone screen recording used as a reference is often VFR; whether the times in `SHOTS.md` drift on such a file is
   untested. A probe that warns "VFR: conformed to N fps first" would cover it.
4. **Safe-zone numbers are not official.** ffmpeg-skill's table (`scripts/_platforms.py`): TikTok top 10 % / bottom 22 % / left 5 % /
   right 14 %; Reels 8 / 20 / 5 / 12; Shorts 6 / 18 / 5 / 12; feed platforms a 5 % border. The file says "measured from each platform's
   published design guidance" but cites no source. A web search on 2026-10-12 found only third-party tools, which disagree (TikTok right
   column 11–22 %, bottom 320–707 px at 1080 × 1920, ads larger than organic posts). The kit's rule today (`workflow/reframe.md`: top
   ~14 %, bottom ~20 %) is in the same range. The user decides which numbers the kit keeps; ads and organic posts may need two sets.
5. **Platform limits age fast.** The same table gives Reels a 90 s maximum; secondary sources say Instagram raised in-app Reels to 3
   minutes in January 2025 (no official page found). Any limit the kit adopts needs a date and a source beside it, like the ElevenLabs
   prices in `qa/prices.json`.
6. **Loudness target.** Their platform rows expect -14 LUFS ± 2; the kit masters at -16 LUFS / -4 dBTP on purpose (the "Sound pass"
   rules). -16 still passes their ± 2 tolerance; a `--platform` check in the kit should report the kit's target, not replace it.

## Build notes for the desktop session

Nothing is copied as shipped; re-write in the kit's own code with a credit line in `docs/THIRD-PARTY.md` ("Techniques and references":
ffmpeg-skill, MIT, commit `f62e7d0`, the probe facts, the HDR → SDR chain, the platform table) and a `docs/CHANGELOG.md` line.

**Row 1: footage facts and an SDR copy**
- Facts from `ffmpeg -hide_banner -i <clip>` (no ffprobe): the video stream line carries the pixel format and the colour tags, e.g.
  `yuv420p10le(tv, bt2020nc/bt2020/arib-std-b67)`; rotation shows as a `displaymatrix: rotation of -90.00 degrees` side-data line;
  Dolby Vision as a `DOVI configuration record` side-data line. Same rules as `scripts/_common/probe.py:236-280` at the commit above:
  HDR = transfer `smpte2084` (PQ) or `arib-std-b67` (HLG) or a Dolby Vision record; BT.2020 primaries on an SDR transfer is wide-gamut
  SDR (gamut conversion only, no tone map: `color.py` `bt2020_sdr_to_bt709_chain`, which explains that a tone map would darken white
  from Y 235 to 151); 10-bit alone is not HDR (GoPro). VFR: ffmpeg-skill compares `r_frame_rate` with `avg_frame_rate` (ffprobe
  fields); from the banner, `tbr` against `fps` is the nearest equivalent, or count frame timestamps with `-vf showinfo` on a few
  windows. Decide which on the desktop.
- Tone map (`scripts/color.py:155-169`), with the kit's ffmpeg:
  `zscale=tin=<trc>:pin=<prim>:min=<matrix>:rin=tv:t=linear:npl=1000,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p`
  (`npl` is their `--peak`, default 1000 nits, `color.py:207`; `hable` is their default curve, `mobius` and `bt2390` the options).
- Output: an H.264 SDR BT.709 copy at a constant rate (`-fps_mode cfr`, the source's rate or 60), rotation applied, beside the original
  in `03_HTML/assets/video/` (the original is never touched), and a one-line note of what was done. `cutout` uses the copy.
- Log footage (`_common/probe.py` `analyze_levels`, lines 455-497): a flat, low-contrast picture tagged SDR. Only a warning plus "ask for the
  camera's LUT"; applying a `.cube` (`lut3d`) can come later (row 4).
- Tests: an engine test with tiny synthetic clips made by ffmpeg itself (`testsrc2` encoded as HLG-tagged 10-bit HEVC, a rotated clip,
  a VFR clip from timestamps), so no media is committed; then one real iPhone HDR clip on the desktop (stills before / after). Not a
  Gallery change; `gallery check` not needed.

**Row 2: platform safe zones and delivery check**
- Table: their `PLATFORMS` (`scripts/_platforms.py`) as a starting point, each number with its source and date once verified (risk 4).
  Keep it in one JSON file the lint, stills and export read.
- `kit.py lint`: with film.json `"platform": "tiktok"` (or reels / shorts), text and logos at rest inside the shaded edges are a warning,
  next to the existing `(w + h) / 55` margin check in `engine/qa/buildlint.py`.
- `kit.py stills --phone`: draw the shaded zones on the phone-width stills when the film names a platform.
- `kit.py mp4 --platform <name>`: after the export, rows like `check.py` (duration, aspect, fps, codec, pixel format, size, LUFS, true
  peak) printed in the export log; the kit's MP4 is H.264 High `yuv420p` 60 fps (`engine/kit.py` `VIDEO`), so most rows pass today.
- Tests: `engine/tests/smoke_new_project.py` plus a lint case with a word placed in a TikTok zone.

**Row 3: skill rules** (in `engine/skill/moworks-motion/`, then `engine/tests/pack_skill.py`)
- From `references/devices.md` and `references/gotchas.md` at the commit above, in the kit's words: phone and screen recordings are VFR
  until proven otherwise; 10-bit is not HDR, the colour tags decide; iPhone HDR is HLG / Dolby Vision and must be mapped to SDR before
  use; portrait phone clips carry a rotation tag; Log footage looks grey and needs the camera's LUT; 60 → 30 fps halves the motion
  samples (keep 60); a clip at -40 LUFS or below is room tone, never raised to a speech level.
