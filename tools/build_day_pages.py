"""index.html을 복사해 day1.html ~ day6.html을 만듭니다.

GitHub Pages는 /day1 주소로 들어오면 day1.html을 보여주므로, 날짜별 주소로 바로
들어오거나 새로고침해도 같은 앱이 열립니다. 각 파일은 공유 미리보기(카카오톡 등)를 위해
제목과 대표 이미지만 그날의 것으로 바꿉니다.

index.html이나 app.js의 DAYS를 고친 뒤에는 다시 실행하세요:
    python3 tools/build_day_pages.py
"""
import re
from html import escape
from pathlib import Path

root = Path(__file__).resolve().parent.parent
index = (root / "index.html").read_text(encoding="utf-8")
app = (root / "app.js").read_text(encoding="utf-8")

days = re.findall(r'n: (\d), date: "[^"]+", label: "([^"]+)", title: "([^"]+)", ref: "([^"]+)"', app)
assert len(days) == 6, f"DAYS를 찾지 못했습니다 ({len(days)}개)"


def sub_once(pattern, repl, text):
    out, count = re.subn(pattern, lambda _: repl, text, count=1)
    assert count == 1, f"index.html에서 찾지 못함: {pattern}"
    return out


for n, label, title, ref in days:
    page = index
    page = sub_once(r"<title>.*?</title>", f"<title>DAY.{n} {escape(title)} · 2026 가을특별새벽부흥회</title>", page)
    page = sub_once(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="DAY.{n} {escape(title)}">', page)
    page = sub_once(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{label} · {escape(ref)} · 2026 가을특별새벽부흥회">', page)
    page = sub_once(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="bible_cards/day{n}_f.jpg">', page)
    page = page.replace("<!doctype html>", "<!doctype html>\n<!-- tools/build_day_pages.py가 index.html에서 생성한 파일입니다. 직접 고치지 마세요. -->", 1)
    (root / f"day{n}.html").write_text(page, encoding="utf-8")
    print(f"day{n}.html")
