AI models the kit runs on this machine (CPU; nothing is uploaded). Not in the git repo: `install.bat` / `update.bat` download the
missing ones here after asking, from the addresses and sizes in `engine/models.json`.

- `faster-whisper-small` (484 MB): speech to text with word times. Used by `kit.py transcribe` and `kit.py align`
  (`engine/audio/transcribe.py`, `align.py`): words.json + .srt per voice, motion and sound effects on the voice's words, captions.
- `rembg/models` (355 MB): background removal. Used by `kit.py cutout` (`engine/intake/cutout.py`): isnet-general-use (objects, default)
  and u2net_human_seg (people, `--people`). rembg finds them through U2NET_HOME = `<kit>/engine/models/rembg`.

The Python packages (faster-whisper, rembg) are the installer's optional ones.
