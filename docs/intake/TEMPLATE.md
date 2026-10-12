# Intake: <owner/repo>

- **Read:** <YYYY-MM-DD>, commit `<sha>`, <url>
- **Licence:** <code licence> · assets: <licence or "none" or "unclear: ...">
- **What it is:** <two or three sentences>

## Tóm tắt cho người dùng

| # | Lấy gì | Gộp vào đâu trong kit | Giấy phép | Giá trị | Công sức | Đề xuất |
|---|---|---|---|---|---|---|
| 1 | <a piece: file / feature> | <preset group, layout, `kit.py <command> --flag`, skill file> | <licence> | cao / vừa / thấp | <hours> | lấy nguyên bản / viết lại / không lấy |

**Kết luận:** <one or two sentences: worth integrating or not, and in what order>

## Already in the kit

<what overlaps with existing presets / commands, and which one is better and why>

## Not taken, and why

<pieces left out: licence, non-deterministic, needs a GPU / network, duplicates the kit, low value>

## Risks and open questions

<anything the desktop session or the user must decide>

## Build notes for the desktop session

- Files to copy as shipped (paths at the commit above) and where they go
- Entry points, parameters, dependencies (and their licences, sizes)
- How it becomes deterministic on the film's clock (seeking, seeds)
- What to test: Gallery demo idea, a test film, AE port expectations
