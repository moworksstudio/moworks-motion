"""kit.py track: time and tokens per stage of a film (asked by the user 07/10/2026: "ghi note lại toàn cảnh duration làm việc + số lượng token
đã chi ở từng giai đoạn như 1st version - revise version ... để tracking sau khi xong video").

  kit.py track <project> "<stage>"   a new stage starts now (the open one ends): "Prep", "First cut", "Fixes 1", "MOV export", ...
  kit.py track <project> end         the open stage ends now (the film is done, or work stops for a while)
  kit.py track <project> report      the table -> <project>/qa/tracking.md (and printed)

Stages are kept in <project>/qa/tracking.json with their start / end (UTC) and the Claude Code session that marked them
(CLAUDE_CODE_SESSION_ID, set by Claude Code for every command it runs). The numbers come from that session's own transcript,
%USERPROFILE%/.claude/projects/<folder>/<session>.jsonl (plus its subagents' files), so nothing is estimated:
  - tokens: every API reply in the stage's window, counted once per message id (a reply is written on several lines): fresh input (input +
    cache writes), cache reads, output (thinking included);
  - Claude's time: from each message that starts Claude's work (the user's message, a task notification) to the last reply before the next
    one, minus the time a question (AskUserQuestion) waited for the user's answer (08/10/2026, Test 3: those minutes were counted as
    Claude's); background = the time from Claude's last reply to a task notification (a command running in the background, the machine's
    time, not the user's); waiting = the rest of the stage's wall time (the user watching, writing notes, answering, away).
Work done outside Claude Code (no session) shows its wall time only.
The report also lists every turn of the chat (each message that started Claude's work: Claude's time, the wait, calls, tokens, its first words),
and works with no stage marked (the current session as one stage), so a film where nobody ran `track` still gets its numbers.
API-equivalent cost (user, 07/10/2026 A/B test: "báo cả tiền API"; 08/10/2026: the user is on a Max plan, so this is what the same work
would cost on the API, not a bill): every reply priced by its own model and token kinds (input, cache writes 5 min /
1 h, cache reads, output; fast mode) from engine/qa/prices.json (first-party API rates with their source; a Claude subscription bills
differently). A model missing there is reported, never guessed (from the test session's session_cost.py)."""
import json, os, time
from datetime import datetime, timezone
from pathlib import Path

PROJECTS_DIR = Path(os.environ.get("USERPROFILE") or Path.home()) / ".claude" / "projects"
PRICES = json.loads((Path(__file__).resolve().parent / "prices.json").read_text(encoding="utf-8"))
KINDS = ("in", "w5", "w1h", "read", "out")


def _split(u):
    """one reply's tokens by price kind; cache writes without a 5 min / 1 h split count as 1 h (what Claude Code writes)"""
    cc = u.get("cache_creation") or {}
    w5, w1 = cc.get("ephemeral_5m_input_tokens"), cc.get("ephemeral_1h_input_tokens")
    if w5 is None and w1 is None: w5, w1 = 0, u.get("cache_creation_input_tokens") or 0
    return {"in": u.get("input_tokens") or 0, "w5": w5 or 0, "w1h": w1 or 0, "read": u.get("cache_read_input_tokens") or 0, "out": u.get("output_tokens") or 0}


def _usd(u, model, lost=None):
    """USD of one reply, or None when its model has no price (named in lost). "<synthetic>" replies are Claude Code's own notices (a usage
    limit reached, an interrupted turn) with zero tokens: they cost nothing (the 2D rebuild test's table showed "?" for whole stages because of them)"""
    if model == "<synthetic>" or not any(_split(u).values()): return 0.0
    pr = PRICES["models"].get(model) or PRICES["models"].get((model or "").split("[")[0])
    if not pr:
        if lost is not None and model: lost.add(model)
        return None
    k = _split(u); f = pr.get("fast", 1.0) if u.get("speed") == "fast" else 1.0
    return f * sum(k[x] * pr[x] for x in KINDS) / 1e6


def _money(x): return "?" if x is None else f"${x:,.2f}"


def _now(): return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
def _t(s): return datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
def _local(s): return time.strftime("%d/%m %H:%M", time.localtime(_t(s)))
def _dur(sec):
    sec = int(round(sec)); h, m = sec // 3600, sec % 3600 // 60
    return f"{h} h {m:02d} ph" if h else f"{m} ph {sec % 60:02d} s" if m else f"{sec} s"
def _tok(n): return f"{n:,}".replace(",", ".")


def _load(p):
    f = Path(p) / "qa" / "tracking.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {"stages": []}


def _save(p, d):
    f = Path(p) / "qa" / "tracking.json"; f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")


def mark(p, name, say=print):
    d = _load(p); now = _now(); sid = os.environ.get("CLAUDE_CODE_SESSION_ID")
    for s in d["stages"]:
        if not s.get("end"): s["end"] = now
    d["stages"].append({"name": name, "start": now, "session": sid})
    _save(p, d)
    say(f"track: \"{name}\" starts {_local(now)}" + ("" if sid else " (not inside Claude Code: wall time only)"))


def end(p, say=print):
    d = _load(p); now = _now(); n = 0
    for s in d["stages"]:
        if not s.get("end"): s["end"] = now; n += 1
    _save(p, d); say(f"track: {n} open stage(s) ended {_local(now)}")


def _files(sid):
    out = []
    for f in PROJECTS_DIR.glob(f"*/{sid}.jsonl"): out.append(f)
    for d in PROJECTS_DIR.glob(f"*/{sid}"):
        if d.is_dir(): out += sorted(d.rglob("*.jsonl"))            # subagents of that session
    return out


def _text(c):
    if isinstance(c, str): return c
    if isinstance(c, list): return " ".join(b.get("text", "") for b in c if isinstance(b, dict) and b.get("type") == "text")
    return ""


def _events(sid, prompts=None, extra=None):
    """(replies, starts, lasts) of one session: replies = {message id: (time, usage, model)}, starts = times that start Claude's work (main
    chat); prompts (a list): filled with (time, first words) for every start, for the per-turn table; extra (a dict): "asks" = [(asked,
    answered)] for AskUserQuestion, "tasks" = times of task notifications (a background command finished)"""
    replies, starts, lasts = {}, [], []
    asked, asks, tasks = {}, [], []
    for f in _files(sid):
        with open(f, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                if '"timestamp"' not in line: continue
                try: e = json.loads(line)
                except ValueError: continue
                ts = e.get("timestamp"); m = e.get("message")
                if not ts or not isinstance(m, dict): continue
                t = _t(ts)
                if e.get("type") == "assistant" and isinstance(m.get("usage"), dict):
                    replies.setdefault(m.get("id") or (f.name, ts), (t, m["usage"], m.get("model") or ""))
                    if not e.get("isSidechain"):
                        lasts.append(t)
                        for blk in m.get("content") if isinstance(m.get("content"), list) else []:
                            if isinstance(blk, dict) and blk.get("type") == "tool_use" and blk.get("name") == "AskUserQuestion": asked[blk.get("id")] = t
                elif e.get("type") == "user" and not e.get("isSidechain") and not e.get("isMeta"):
                    c = m.get("content")
                    if isinstance(c, list) and any(isinstance(b, dict) and b.get("type") == "tool_result" for b in c):
                        for blk in c:
                            if isinstance(blk, dict) and blk.get("tool_use_id") in asked: asks.append((asked.pop(blk["tool_use_id"]), t))
                        lasts.append(t); continue
                    txt = " ".join(_text(c).split())
                    if "<task-notification>" in txt[:300]: tasks.append(t)
                    if txt.startswith("<system-reminder>") and "working directory" in txt and len(txt) < 900: continue   # a folder switch, not a prompt
                    if txt.startswith(("<local-command", "<command-name>", "<command-message>", "This session is being continued")): continue   # /compact etc.
                    starts.append(t)
                    if prompts is not None: prompts.append((t, txt))
    if prompts is not None: prompts.sort()
    if extra is not None: extra.update(asks=sorted(asks), tasks=sorted(tasks))
    return replies, sorted(starts), sorted(lasts)


def _overlap(spans, a, b):
    return sum(max(0.0, min(y, b) - max(x, a)) for x, y in spans)


def _turns(sid, a=0.0, b=float("inf")):
    """one row per message that started Claude's work in [a, b) (the user's prompts, task notifications): Claude's time, the wait until the
    next one, API calls and tokens (from the test session's session_stats.py, 07/10/2026)"""
    prompts, X = [], {}
    replies, starts, lasts = _events(sid, prompts, X)
    rows = []
    for i, (s, txt) in enumerate(prompts):
        nxt = prompts[i + 1][0] if i + 1 < len(prompts) else float("inf")
        if not (s < b and nxt > a): continue              # the turn that was running when the first stage was marked counts too (Test 3)
        act = [x for x in lasts if s <= x < nxt]
        last = max(act) if act else s
        ask = _overlap(X["asks"], s, last)
        gap = (nxt - last) if nxt != float("inf") else 0.0
        bg = gap if any(abs(t - nxt) < 1e-6 for t in X["tasks"]) else 0.0
        r = {"t": s, "text": txt, "act": last - s - ask, "wait": gap - bg + ask, "bg": bg, "calls": 0, "inp": 0, "cr": 0, "out": 0, "usd": 0.0}
        for t, u, mo in replies.values():
            if s <= t < nxt:
                r["calls"] += 1; r["inp"] += (u.get("input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0)
                r["cr"] += u.get("cache_read_input_tokens") or 0; r["out"] += u.get("output_tokens") or 0
                c = _usd(u, mo); r["usd"] = None if (c is None or r["usd"] is None) else r["usd"] + c
        rows.append(r)
    return rows


def _active(starts, lasts, a, b, X=None):
    """(Claude's working seconds, background seconds) inside [a, b]: each start runs to the last activity before the next start, less the
    questions waiting for an answer; the gap before a task notification is the machine's (a background command), not the user's"""
    tot = bg = 0.0; X = X or {"asks": [], "tasks": []}
    for i, s in enumerate(starts):
        nxt = starts[i + 1] if i + 1 < len(starts) else float("inf")
        act = [x for x in lasts if s <= x < nxt]
        if not act: continue
        lo, hi = max(s, a), min(max(act), b)
        if hi > lo: tot += hi - lo - _overlap(X["asks"], lo, hi)
        if nxt != float("inf") and any(abs(t - nxt) < 1e-6 for t in X["tasks"]):
            bg += max(0.0, min(nxt, b) - max(max(act), a))
    return tot, bg


def report(p, say=print):
    d = _load(p)
    if not d["stages"]:                                   # nobody marked a stage: the whole current session as one, so the turns still show
        sid = os.environ.get("CLAUDE_CODE_SESSION_ID")
        if not sid: raise SystemExit("track: no stage yet (kit.py track <project> \"First cut\")")
        prompts = []; _events(sid, prompts)
        if not prompts: raise SystemExit("track: no stage yet and nothing in this session's log")
        d = {"stages": [{"name": "Cả phiên (chưa đánh dấu giai đoạn)", "start": datetime.fromtimestamp(prompts[0][0], timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                         "session": sid}]}
    sids = sorted({s["session"] for s in d["stages"] if s.get("session")})
    XS = {sid: {} for sid in sids}
    ev = {sid: _events(sid, None, XS[sid]) for sid in sids}
    if sids and d["stages"]:                              # the first stage starts with the message that began the job (the turn running when it
        st0 = d["stages"][0]; a0 = _t(st0["start"])       # was marked; Test 3: 10:24 to the first mark counted nowhere)
        ss = [x for sid in sids for x in ev[sid][1] if x <= a0]
        if ss and a0 - max(ss) < 3 * 3600:
            st0 = dict(st0, start=datetime.fromtimestamp(max(ss), timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"); d = dict(d, stages=[st0] + d["stages"][1:])
    gaps = [(d["stages"][i]["end"], d["stages"][i + 1]["start"]) for i in range(len(d["stages"]) - 1)
            if d["stages"][i].get("end") and _t(d["stages"][i + 1]["start"]) - _t(d["stages"][i]["end"]) > 60]
    if gaps:                                              # time between a `track end` and the next stage (Test 4): a row, so the total adds up
        st = []
        for s in d["stages"]:
            st.append(s)
            for g0, g1 in gaps:
                if g0 == s.get("end"): st.append({"name": "(giữa hai giai đoạn)", "start": g0, "end": g1, "session": s.get("session")})
        d = dict(d, stages=st)
    now = time.time(); rows = []; lost = set()
    T = {"wall": 0, "act": 0, "bg": 0, "calls": 0, "inp": 0, "cr": 0, "out": 0, "usd": 0.0, **{"k_" + k: 0 for k in KINDS}}
    for s in d["stages"]:
        a, b = _t(s["start"]), (_t(s["end"]) if s.get("end") else now)
        r = {"name": s["name"] + ("" if s.get("end") else " (đang làm)"), "start": _local(s["start"]), "wall": b - a, "act": 0.0, "bg": 0.0,
             "calls": 0, "inp": 0, "cr": 0, "out": 0, "usd": 0.0, **{"k_" + k: 0 for k in KINDS}, "known": bool(sids)}
        for sid in sids:                                   # every session the film used: work in a window counts wherever it happened
            replies, starts, lasts = ev[sid]
            ac, bg = _active(starts, lasts, a, b, XS[sid]); r["act"] += ac; r["bg"] += bg
            for t, u, mo in replies.values():
                if a <= t < b:
                    r["calls"] += 1; r["inp"] += (u.get("input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0)
                    r["cr"] += u.get("cache_read_input_tokens") or 0; r["out"] += u.get("output_tokens") or 0
                    for k, v in _split(u).items(): r["k_" + k] += v
                    c = _usd(u, mo, lost); r["usd"] = None if (c is None or r["usd"] is None) else r["usd"] + c
        r["act"] = min(r["act"], r["wall"]); r["bg"] = min(r["bg"], r["wall"] - r["act"])
        for k in T:
            if k == "usd": T[k] = None if (T[k] is None or r[k] is None) else T[k] + r[k]
            else: T[k] += r[k]
        rows.append(r)
    models = sorted({mo for sid in sids for _, _, mo in ev[sid][0].values() if mo and mo != "<synthetic>"})
    head = ["| Giai đoạn | Bắt đầu | Tổng thời gian | Claude làm | Máy chạy nền | Chờ bạn | Lượt gọi | Token đầu vào mới | Token đọc cache | Token đầu ra | Tổng token | Giá API tương đương |",
            "|---|---|---|---|---|---|---|---|---|---|---|---|"]
    line = lambda r, name, start: (f"| {name} | {start} | {_dur(r['wall'])} | {_dur(r['act'])} | {_dur(r['bg'])} | {_dur(r['wall'] - r['act'] - r['bg'])} | {r['calls']} | "
                                   f"{_tok(r['inp'])} | {_tok(r['cr'])} | {_tok(r['out'])} | {_tok(r['inp'] + r['cr'] + r['out'])} | {_money(r['usd'])} |")
    body = [line(r, r["name"], r["start"]) for r in rows] + [line(T, "**Cả phim**", "")]
    cost_head = ["| Giai đoạn | Đầu vào | Ghi cache 5 ph | Ghi cache 1 h | Đọc cache | Đầu ra | **USD** |", "|---|---|---|---|---|---|---|"]
    cost_line = lambda r, name: f"| {name} | " + " | ".join(_tok(r["k_" + k]) for k in KINDS) + f" | **{_money(r['usd'])}** |"
    cost = [cost_line(r, r["name"]) for r in rows] + [cost_line(T, "**Cả phim**")]
    md = [f"# Theo dõi thời gian và token: {Path(p).name}", "",
          f"Lập lúc {time.strftime('%d/%m/%Y %H:%M')} bằng `kit.py track {Path(p).name} report`. Số liệu đọc từ nhật ký phiên Claude Code "
          f"({len(sids)} phiên{', model ' + ', '.join(models) if models else ''}), không ước lượng.", "", *head, *body, "",
          "- Tổng thời gian: từ lúc bắt đầu giai đoạn tới lúc giai đoạn sau bắt đầu (hoặc `track end`).",
          "- Claude làm: từ mỗi tin nhắn giao việc tới lượt trả lời cuối trước tin nhắn kế tiếp, trừ lúc câu hỏi chờ bạn trả lời. Máy chạy nền: "
          "Claude đã trả lời, máy chạy lệnh nền tới khi có thông báo xong. Chờ bạn: phần còn lại (xem phim, ghi chú, trả lời, vắng mặt).",
          "- Token đầu vào mới: đầu vào + ghi cache. Token đọc cache: ngữ cảnh đọc lại từ cache (rẻ hơn nhiều). Token đầu ra: gồm cả phần suy nghĩ.",
          "", "## Giá API tương đương theo loại token", "", *cost_head, *cost, "",
          f"- Giá API công bố của Anthropic (USD / triệu token) trong `engine/qa/prices.json` ({PRICES['source']}; soát {PRICES['checked']}). "
          "Mỗi lượt gọi tính theo đúng model của nó. Đây là **giá API tương đương**: gói Claude (Pro / Max / Team) không tính tiền theo số này; "
          "dùng nó để so khối lượng giữa các lần làm."]
    if lost: md.append(f"- Chưa có giá cho model {', '.join(sorted(lost))}: thêm vào prices.json (giá tra bằng skill claude-api). Ô '?' là chưa tính được.")
    if not sids: md.append("- Không có phiên Claude Code nào được ghi: chỉ có thời gian, không có token.")
    a0 = min(_t(s["start"]) for s in d["stages"])
    b0 = max((_t(s["end"]) if s.get("end") else now) for s in d["stages"])
    for sid in sids:                                      # every message that started Claude's work, in the film's time span
        tr = _turns(sid, a0, b0 + 1)
        if not tr: continue
        md += ["", f"## Theo lượt chat (phiên {sid[:8]})", "",
               "| # | Lúc | Claude làm | Máy chạy nền | Chờ bạn | Lượt gọi | Token đầu vào mới | Token đọc cache | Token đầu ra | Giá API tương đương | Tin nhắn |", "|---|---|---|---|---|---|---|---|---|---|---|"]
        for i, r in enumerate(tr, 1):
            txt = r["text"][:90].replace("|", "/") + ("…" if len(r["text"]) > 90 else "")
            md.append(f"| {i} | {time.strftime('%d/%m %H:%M', time.localtime(r['t']))} | {_dur(r['act'])} | {_dur(r['bg'])} | {_dur(r['wait'])} | {r['calls']} | "
                      f"{_tok(r['inp'])} | {_tok(r['cr'])} | {_tok(r['out'])} | {_money(r['usd'])} | {txt} |")
    out = Path(p) / "qa" / "tracking.md"; out.parent.mkdir(parents=True, exist_ok=True); out.write_text("\n".join(md) + "\n", encoding="utf-8")
    for x in [*head, *body]: say(x)
    if lost: say(f"track: no price for {', '.join(sorted(lost))} in engine/qa/prices.json (look it up with the claude-api skill and add it)")
    say(f"-> {out}")
    return out
