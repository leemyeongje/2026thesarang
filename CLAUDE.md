# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is a mobile-first static website for **2026 가을특별새벽부흥회** (2026 Autumn Special Dawn Revival) at 더THE사랑교회. The theme is "하나님의 사랑에서 끊을 수 없으리라" (롬 8:38-39). It runs 2026.10.12 (월) – 10.17 (토), at 5:00 AM Monday to Friday and 6:00 AM on Saturday, in the main sanctuary (본당).

The site is plain HTML/CSS/JS (`index.html`, `style.css`, `app.js`) with no build step and no dependencies. It is intended for GitHub Pages.

## Commands

- Local preview: run `python3 -m http.server 8000` and open http://localhost:8000. Opening `index.html` via `file://` breaks sermon loading, because the page uses `fetch`.
- There is no build, lint, or test step.

## Architecture

- **Board (home):** a hero section followed by an arch-shaped "출석 체크" board that replicates the printed attendance sheet (`attendance card.png`). Do not add a heart sticker; the user explicitly removed it.
  - The board's day circles are `<a href="#dayN">` links.
  - `app.js` intercepts clicks on them, calls `pushState`, and opens the detail view.
- **Detail view** (`#detail`): a fixed overlay revealed with a `clip-path` circle that grows from the tapped day circle, and closes back into it.
  - Routing is hash-based (`#day1`–`#day6`), so deep links and the browser back button work.
  - It contains the flippable scripture card, the YouTube embed, and the AI summary.
- **Card flip:** the card is a `preserve-3d` element with two `.face` children (`.is-front` / `.is-back`). Only the header is pinned (`.pinned`, sticky); the card scrolls away with the content, which the user asked for.
  - `.stage` fills the first screen (`100svh` minus the header) with the card vertically centered. Below the card, `.stage-foot` holds either a bobbing down-arrow (`.scroll-hint`, which scrolls to the sermon) or, when there is no sermon, the pending note.
  - Scrolling down past 30% of the stage's height snaps the card to the back while it is still visible; scrolling back above 15% snaps it to the front. This is a discrete flip, not scroll-scrubbed.
  - Tap, horizontal drag, and the keyboard also flip it. These matter for days without a sermon, where there is nothing to scroll.
  - The user asked for no side-indicator dots.
  - On open, a short "peek" wiggle hints that the card can be turned.
  - Two pitfalls broke this before:
    - The bare class `.back` is already used by the back button, so don't reuse it for the face.
    - Don't put `mix-blend-mode` inside the 3D context, because it flattens the transform in Chrome.
- **Day data:** the `DAYS` array at the top of `app.js` holds each day's title, passage, and verse text, transcribed from `bible_cards/`. The verse text is used as alt text.
- **Sermons are content-driven.** To publish a day, add `sermon/dayN.md`; nothing else needs to change.
  - `parseSermon()` takes the first YouTube URL as the video. `#` becomes the label, `##` becomes a section heading, and `-` becomes a bullet.
  - A short `라벨: ` prefix at the start of a bullet is rendered in bold.
  - When the file is missing (404), the view shows a "설교 영상과 요약은 … 새벽예배 후에 올라옵니다" note.
  - The format is a YouTube link on the first line, then `# AI 요약`, then numbered `##` sections with bullets.
- **The YouTube iframe is inserted only after the reveal animation finishes**, so it doesn't make the transition janky.

## Assets

- `assets/` holds the files the site serves. They were generated from the originals with Python/PIL:
  - `assets/cards/*.webp`: converted copies of `bible_cards/*.jpg`.
  - `assets/bg.webp`: `horizontal poster.png` with its text patched out using clean texture, which leaves the texture and the handclasp. It is used as the fixed backdrop.
  - `assets/og.jpg`: the share image. `og:image` is a relative path; change it to an absolute URL after deploying so KakaoTalk previews work.
- If a card image changes, regenerate its webp (for example with PIL: `Image.open(src).convert('RGB').save(dst, quality=82)`).
- The originals (`bible_cards/`, the poster, and the attendance photo) are source material and are not referenced by the page.

## Design language

- Fonts are from `font_info.md`:
  - Titles, `DAY.N` labels, and dates use **카페24 클래식타입** (Cafe24 Classic Type), loaded from jsDelivr (`projectnoonnu/noonfonts_2210-2`).
  - Body text uses **Pretendard**.
- Colors come from the poster: an earthy gold-brown texture, cream text, a paper board (`--paper`), and slate ink (`--ink`).
- Keep the church's existing look. Prefer intuitive gestures and visual cues over extra text buttons.
- All content is in Korean. Keep the date format (`10.12(월)`) and the 개역개정 wording consistent with the cards.
