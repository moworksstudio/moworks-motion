"""AE port regression: port every case film in %USERPROFILE%\\.aimotionkit\\work\\ae-cases into the open After Effects (kit.py ae --run
--check auto) and record, per case, the share of pixels that differ by more than 40/255 between the browser and AE at the check times.

python run_cases.py            all cases            -> results.json + results.md next to this script
python run_cases.py words      cases whose name contains "words" (their rows replace the old ones; the other cases' results are kept)
Needs After Effects (or AE Beta) open with no dialog; the kit's own earlier ports are closed without saving (user's choice 05/10/2026)."""
import json, re, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parents[2]                 # engine/tests/ae -> the kit
CASES = Path.home() / ".aimotionkit" / "work" / "ae-cases"


def main():
    filt = sys.argv[1] if len(sys.argv) > 1 else ""
    # a filtered run updates its own rows only (11/10/2026: one case run alone wrote over the results of all the others)
    try: out = json.loads((HERE / "results.json").read_text(encoding="utf-8")) if filt else {}
    except (OSError, ValueError): out = {}
    for d in sorted(p for p in CASES.iterdir() if p.is_dir() and (p / "index.html").exists() and filt in p.name):
        t0 = time.time()
        r = subprocess.run([sys.executable, "-B", str(KIT / "engine" / "kit.py"), "ae", str(d), "--run", "--check", "auto"],
                           capture_output=True, text=True, encoding="utf-8", errors="replace", env={**__import__("os").environ, "PYTHONIOENCODING": "utf-8"})
        txt = r.stdout + r.stderr
        checks = [(float(t), float(p)) for t, p in re.findall(r"check ([\d.]+) s: ([\d.]+)% of pixels", txt)]
        err = [l.strip() for l in txt.splitlines() if "ERROR" in l or "Traceback" in l][:3]
        out[d.name] = {"checks": checks, "max": max([p for _, p in checks], default=None), "errors": err, "seconds": round(time.time() - t0, 1)}
        print(f"{d.name}: {', '.join(f'{p:.2f}%' for _, p in checks) or 'no check'}{'  ERRORS ' + str(err) if err else ''} ({out[d.name]['seconds']} s)", flush=True)
    out = dict(sorted(out.items()))
    (HERE / "results.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    rows = ["| Case | Max % of pixels > 40/255 | Per check time | Errors |", "|---|---|---|---|"]
    for k, v in out.items():
        rows.append(f"| {k} | {v['max'] if v['max'] is not None else '-'} | {', '.join(f'{t:g} s: {p:.2f}' for t, p in v['checks'])} | {'; '.join(v['errors'])} |")
    (HERE / "results.md").write_text(f"# AE port cases, {time.strftime('%Y-%m-%d %H:%M')}\n\n" + "\n".join(rows) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
