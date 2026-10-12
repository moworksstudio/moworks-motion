# Moworks Motion: instructions for Claude sessions in this repository

Moworks Motion makes motion graphics films in code: HTML + GSAP films built from `film.json`, rendered frame by frame at 60 fps in headless
Chromium (Playwright), exported as MP4 / MOV or an editable After Effects project. Engine: `engine/` (`engine/kit.py` is the CLI). Libraries:
`library/presets/` (motion), `library/layouts/` (layouts / UI), `library/looks/`. The skill for Claude Code: source in
`engine/skill/moworks-motion/`, packed into `skill/moworks-motion.zip`. Read first: `docs/README.md`, `docs/GUIDE.md`, `library/README.md`,
`docs/THIRD-PARTY.md`, `engine/skill/moworks-motion/reference/commands.md`.

## Which session you are

- **Desktop maintenance session**: Windows, the kit folder on the user's machine (`brands/` holds brand packs, After Effects installed,
  Claude's memory for this folder loaded). Build, test and publish here (section "Desktop sessions").
- **Cloud session**: a Linux sandbox with a clone from GitHub (no brand packs, no After Effects, no Windows fonts, no memory). Do **repo
  intake research only** (section "Cloud sessions"). Never change `engine/`, `library/`, `skill/` or the docs in a cloud session.

## Rules for every session

- Talk to the user in Vietnamese: short, plain words, tables. Code, commit messages and file names in English.
- Do only what the user asked. Nothing is deleted for good. Ask before downloading anything large or paid.
- The repository is public (MIT): no client, brand or job names in any tracked file, commit message or pull request.
- Third-party code and assets: source, commit and licence recorded in `docs/THIRD-PARTY.md`; files copied as shipped keep SHA-256 checksums.
- New features extend existing commands and workflows (a flag, a section), never parallel ones. Upstream code as shipped beats a kit re-write
  when it is better; a re-write needs a stated reason.
- `main` is protected: changes arrive by pull request (the maintainer merges). Never force-push, rewrite history or push tags.

## Cloud sessions: repo intake research

The user gives repositories (or articles) to study. For each one:

1. **Read what matters, fully**: README, docs, examples, the source of every part that could be useful, `LICENSE` and per-file / per-asset
   licences. Note the commit you read.
2. **Know the kit first**: its features (`docs/README.md`), commands (`engine/kit.py` usage at the top, `reference/commands.md`), the library
   (`library/presets/*/*/preset.json`, `library/layouts/*/*/preset.json`, `library/README.md`), sources already taken (`docs/THIRD-PARTY.md`),
   open limits (`docs/KNOWN-ISSUES.md`).
3. **Judge each candidate piece** against the kit's constraints:
   - a frame is a pure function of time: a seekable timeline, no unseeded randomness, nothing driven by real time; no network at render time
   - it fits the film model: a preset or layout called from `film.json`, an engine step or command, or a rule in the skill
   - After Effects: plain DOM / SVG / CSS ports as editable layers; canvas / WebGL become picture sequences (say which)
   - Windows first; Python, with Node.js optional; size; how alive the project is
   - licence: MIT, Apache-2.0, BSD, ISC, OFL, CC0 are fine; GPL / AGPL code, non-commercial or no-redistribution assets are not taken
     (say so); unclear = flag it
   - value for a studio making client films, against what the kit already does (an overlap: which one is better and why)
4. **Write the report** `docs/intake/<YYYY-MM-DD>-<repo-name>.md` from `docs/intake/TEMPLATE.md`.
5. **Commit only the report** on the session's own branch (the `claude/...` branch the cloud session works on is fine; never `main`),
   push it, and open a pull request "Intake: <owner/repo>" with the summary table in its description when you can; otherwise give the
   user the branch name. Several repositories in one session: one report each, same branch. Never copy or port the studied code into the
   kit, even when asked to "add" it: say that the desktop session builds it later (as shipped, with checksums, "Mới nhập" and tests) and
   put everything that build needs in the report's build notes.
6. Do not run renders or the Gallery checks in the cloud (they need the Windows setup; the numbers would differ).
7. A site the sandbox's network policy blocks: say which, and continue with what is reachable (GitHub is).

## Desktop sessions: building from intake reports

- Read the report(s), show the user the table (take what, merge where, licence) and wait for the OK before building.
- New presets / layouts go through "Mới nhập" (`kit.py library import`, the user keeps or drops them on the Gallery); engine changes extend
  existing commands; a `docs/THIRD-PARTY.md` row and a `docs/CHANGELOG.md` line for each.
- Before a commit: `engine/tests/smoke_new_project.py`; `kit.py gallery check` when the engine or library changed;
  `engine/tests/ae/run_cases.py` when the AE port changed; skill edits in `engine/skill/moworks-motion/`, then `engine/tests/pack_skill.py`.
- Before a push: `kit.py publish-check`, grep the diff and the commit message for client names, then the user's OK. Versions: a small fix
  is a commit only; a batch worth reading bumps the last number + a CHANGELOG section + a GitHub release; the middle or first number only
  when the user says so.
- Merge intake pull requests once their reports are used (or keep the reports in `docs/intake/` as the record of what was studied).
