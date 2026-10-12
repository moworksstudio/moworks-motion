Roboto Flex (variable font), SIL Open Font License 1.1 (RobotoFlex-OFL.txt), Google Fonts: github.com/google/fonts/ofl/robotoflex.
The default font of every v2 film (CSS family "RFlex").

- RobotoFlex-var.woff2  the films (copied into every project's assets/fonts)
- RobotoFlex-var.ttf    install in Windows (right-click > Install) so After Effects has the same font for the AE port

05/10/2026: replaced the old file (a 234-glyph Latin subset, copied from v1, with no Vietnamese ơ ư đ ă ạ ế…) by the full font (826 characters, Vietnamese complete), downloaded with the user's permission.

Roboto Mono (variable, weight 100-700, upright + italic), SIL Open Font License 1.1 (RobotoMono-OFL.txt), Google Fonts:
github.com/google/fonts/ofl/robotomono. The kit's monospace font (CSS family "RMono") for code / terminal blocks; Vietnamese complete
(1006 glyphs). Downloaded 05/10/2026 with the user's permission; the .woff2 files were made from the .ttf with fontTools.
- RobotoMono-var.woff2, RobotoMono-Italic-var.woff2   the films (kit.py build copies them into the project's assets/fonts)
- RobotoMono-var.ttf, RobotoMono-Italic-var.ttf       install in Windows for the AE port

Playfair Display (variable, weight 400-900, upright + italic, version 1.203), SIL Open Font License 1.1 (PlayfairDisplay-OFL.txt), Google Fonts:
github.com/clauseggers/Playfair-Display. A high-contrast serif for the editorial caption presets (CSS family "AIMK Playfair Display", declared in
preset.json "fonts" with "vendor": kit.py build copies the file into the project's assets/vendor/fonts only when such a preset is used).
Vietnamese complete. Copied 06/10/2026 from the fonts installed on the user's PC (OFL allows it), not downloaded.
- PlayfairDisplay-Regular.ttf, PlayfairDisplay-Italic.ttf   the films; install in Windows for the AE port

Google Fonts families in google/<Family>/ (SIL OFL 1.1, OFL.txt in each folder; github.com/google/fonts/ofl/<family>), downloaded 11/10/2026 with the
user's permission, every one checked for the full Vietnamese alphabet: the public looks (library/looks, kit.py brand) and the caption / card
presets use them, and stand in for families that have no Vietnamese (engine/tests/hf_looks.py SUB, card/talking-card, the caption fonts of engine/vendor/hf-captions-vi).
kit.py brand and the presets copy only the files a film uses into its assets.

12/10/2026: Cormorant Garamond, VT323, Lexend, Sedgwick Ave Display added (same source, licence and check) for HyperFrames' caption themes; engine/tests/hf_captions_vi.py makes the caption faces from these folders.
