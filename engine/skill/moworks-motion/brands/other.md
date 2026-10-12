# A brand with no pack

## Ask first
First look in `brands\<client>\` (a guideline PDF or images there; a folder with only a README and a logo is not a guideline):
a guideline found there is used as it is, so ask only about layout files. Otherwise, before designing, ask once: **does the client have a brand guideline, or a layout file designed frame by frame?** Note the answer in
`notes\NOTES.md`.
- **Layout files of the frames** (PSD / PSB, deck, final frame images): KEEP DESIGN (`workflow/keep-design.md`): its fonts, sizes, colours,
  spacing and logo are the design; the animation is yours and free.
- **A guideline:** ask for its link or file and read ALL of it (a PDF: `kit.py pdf <file> --pages ... --in <project>` renders pages to look
  at, not only their text). Write its DESIGN rules in `notes\NOTES.md` (fonts, type sizes, palette with hex, grid and margins, logo use and
  clear space, imagery, do / don't) and follow them on EVERY piece of text and graphic. A guideline governs the design; in motion only its logo rules bind (the logo
  below); all other motion is free, text effects included.
- **Neither:** FREE DESIGN at maximum creative effort: your own palette, type and layout for this film, with the client's logo and colours
  from their material (deck, product, website) where there is some. Say in `notes\NOTES.md` which colours are the client's and which are
  yours ("own choice"); never present your own colours as the brand's.
- **Brief vs guideline:** before the storyboard, list every point where the brief asks for something the guideline does not allow (colours
  above all, then fonts, sizes, capitals, logo use) and ask the user, one list, brief or guideline for each. When guideline and artwork
  disagree: in KEEP DESIGN keep the artwork and tell the user what differs; in FREE DESIGN ask.

## Fonts
The client's own font files (`assets\fonts\` + `"fonts"` in film.json). Missing → ask for the file. Default otherwise: Roboto Flex. Check
Vietnamese with `kit.py font <family>`. A pack's own fonts (`brands\<pack>\fonts\`) only on that pack's films, unless the user agrees.

## Logo and end card
Official file only, original colours, never redrawn, stretched or given an effect (glitch, blur, split); it may enter and leave as a
whole (fade, slide, uniform scale) unless the guideline says otherwise; a logo animation the guideline itself gives is fine (`SKILL.md`
rule 5). A pack's stricter logo rules (some never let their logos move) apply only to that pack's films. End card with the logo: `"end_tag": { "logo": "assets/logos/logo.png", "bg": "#fff", "width": 0.3 }` (choose `bg`
so the logo reads). Mid-film logo use only where the design has it or the user asks.

## Never on another brand's film
Another pack's end tag, colours (unless asked) or product artwork as the film's hero; its rules do not apply, only the rules in
`SKILL.md`. Exception: a brand with a pack shown as one of the client's own clients (a logo wall of "brands we worked with",
in the client's deck) is a client logo like the others: keep it, treated as rule 5 says for any logo.
