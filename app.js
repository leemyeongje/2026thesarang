// 날짜별 정보는 말씀 카드(bible_cards/)를 기준으로 합니다.
// 설교가 올라오면 sermon/dayN.md 파일만 추가하면 자동으로 영상과 요약이 표시됩니다.
const DAYS = [
  { n: 1, date: "2026-10-12", label: "10.12(월)", title: "결코 정죄함이 없나니", ref: "롬 8:1-2",
    verse: "그러므로 이제 그리스도 예수 안에 있는 자에게는 결코 정죄함이 없나니 이는 그리스도 예수 안에 있는 생명의 성령의 법이 죄와 사망의 법에서 너를 해방하였음이라" },
  { n: 2, date: "2026-10-13", label: "10.13(화)", title: "장차 나타날 영광과 비교할 수 없도다", ref: "롬 8:18",
    verse: "생각하건대 현재의 고난은 장차 우리에게 나타날 영광과 비교할 수 없도다" },
  { n: 3, date: "2026-10-14", label: "10.14(수)", title: "우리의 연약함을 도우시나니", ref: "롬 8:26",
    verse: "이와 같이 성령도 우리의 연약함을 도우시나니 우리는 마땅히 기도할 바를 알지 못하나 오직 성령이 말할 수 없는 탄식으로 우리를 위하여 친히 간구하시느니라" },
  { n: 4, date: "2026-10-15", label: "10.15(목)", title: "모든 것이 합력하여 선을 이루느니라", ref: "롬 8:28",
    verse: "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라" },
  { n: 5, date: "2026-10-16", label: "10.16(금)", title: "누가 우리를 대적하리요", ref: "롬 8:31-32",
    verse: "그런즉 이 일에 대하여 우리가 무슨 말 하리요 만일 하나님이 우리를 위하시면 누가 우리를 대적하리요 자기 아들을 아끼지 아니하시고 우리 모든 사람을 위하여 내주신 이가 어찌 그 아들과 함께 모든 것을 우리에게 주시지 아니하겠느냐" },
  { n: 6, date: "2026-10-17", label: "10.17(토)", title: "하나님의 사랑에서 끊을 수 없으리라", ref: "롬 8:38-39",
    verse: "내가 확신하노니 사망이나 생명이나 천사들이나 권세자들이나 현재 일이나 장래 일이나 능력이나 높음이나 깊음이나 다른 어떤 피조물이라도 우리를 우리 주 그리스도 예수 안에 있는 하나님의 사랑에서 끊을 수 없으리라" },
];

const $ = (s, el = document) => el.querySelector(s);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 출석판 ---------- */
$("#days").innerHTML = DAYS.map((d) => `<li><a class="day" href="#day${d.n}" data-n="${d.n}" aria-label="DAY.${d.n} ${d.label} ${d.title}">
    <span class="day-n">DAY.${d.n}</span><span class="day-d">${d.label}</span>
  </a></li>`).join("");

// 월계수 가지: 줄기를 따라 잎을 배치
(function buildLaurel() {
  const P0 = [30, 70], C = [10, 50], P1 = [12, 6];
  const at = (t) => [0, 1].map((i) => (1 - t) ** 2 * P0[i] + 2 * (1 - t) * t * C[i] + t ** 2 * P1[i]);
  const tan = (t) => [0, 1].map((i) => 2 * (1 - t) * (C[i] - P0[i]) + 2 * t * (P1[i] - C[i]));
  let g = `<path d="M${P0} Q${C} ${P1}" fill="none" stroke-width="1.6"/>`;
  [0.14, 0.3, 0.46, 0.62, 0.78].forEach((t) => {
    const [x, y] = at(t), [dx, dy] = tan(t);
    const a = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    for (const s of [-1, 1]) {
      g += `<ellipse cx="${x}" cy="${y - 5}" rx="2.6" ry="6" stroke="none" transform="rotate(${a + s * 38} ${x} ${y})"/>`;
    }
  });
  const [tx, ty] = P1;
  g += `<ellipse cx="${tx}" cy="${ty - 3}" rx="2.4" ry="5.5" stroke="none" transform="rotate(-12 ${tx} ${ty})"/>`;
  $("#laurel").innerHTML = g;
})();

/* ---------- 상세 화면 ---------- */
const detail = $("#detail");
const scroller = $(".detail-scroll", detail);
const pinned = $(".pinned", detail);
const card = $(".card", detail);
const glares = detail.querySelectorAll(".glare");
const sermonEl = $(".sermon", detail);
let current = null;
let anim = null;

function circleOf(n) {
  const el = document.querySelector(`.day[data-n="${n}"]`);
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
}
function clipFrames(n) {
  const c = circleOf(n);
  const far = Math.hypot(Math.max(c.x, innerWidth - c.x), Math.max(c.y, innerHeight - c.y));
  return [`circle(${c.r}px at ${c.x}px ${c.y}px)`, `circle(${far}px at ${c.x}px ${c.y}px)`];
}

function render(d) {
  $("#detail-title").innerHTML = `DAY.${d.n}<small>${d.label}</small>`;
  const [front, back] = card.querySelectorAll("img");
  front.src = `assets/cards/day${d.n}_f.webp`;
  front.alt = `${d.label} ${d.title} (${d.ref})`;
  back.src = `assets/cards/day${d.n}_r.webp`;
  back.alt = `${d.ref} ${d.verse}`;
  setAngle(0, false);
  scroller.scrollTop = 0;
  pinned.classList.remove("scrolled");
  scrolledToSermon = false;
  sermonEl.innerHTML = "";
  loadSermon(d);
}

function open(n, animate = true) {
  const d = DAYS.find((x) => x.n === n);
  if (!d) return;
  current = d;
  render(d);
  document.documentElement.classList.add("lock");
  detail.hidden = false;
  anim?.cancel();
  if (!animate || reduceMotion) {
    detail.classList.remove("entering");
    peek(300);
    return;
  }
  detail.classList.add("entering");
  anim = detail.animate({ clipPath: clipFrames(n) }, { duration: 620, easing: "cubic-bezier(.7,0,.2,1)" });
  setTimeout(() => detail.classList.remove("entering"), 260);
  anim.finished.then(() => peek(250)).catch(() => {});
  scroller.focus({ preventScroll: true });
}

function close(animate = true) {
  if (!current) return;
  const n = current.n;
  current = null;
  const done = () => {
    detail.hidden = true;
    document.documentElement.classList.remove("lock");
    sermonEl.innerHTML = ""; // 영상 재생 중지
    document.querySelector(`.day[data-n="${n}"]`)?.focus({ preventScroll: true });
  };
  anim?.cancel();
  if (!animate || reduceMotion) return done();
  const a = (anim = detail.animate({ clipPath: clipFrames(n).reverse() }, { duration: 480, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" }));
  a.finished.then(() => { if (current) return; done(); a.cancel(); }).catch(() => {});
}

/* ---------- 라우팅 (#dayN) ---------- */
const dayFromHash = () => Number((location.hash.match(/^#day([1-6])$/) || [])[1]) || null;

document.addEventListener("click", (e) => {
  const a = e.target.closest(".day");
  if (!a || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  history.pushState({ day: +a.dataset.n }, "", `#day${a.dataset.n}`);
  open(+a.dataset.n);
});
$(".back", detail).addEventListener("click", () => {
  if (history.state?.day) history.back();
  else { history.replaceState(null, "", location.pathname + location.search); close(); }
});
addEventListener("popstate", () => {
  const n = dayFromHash();
  if (n) open(n); else close();
});
addEventListener("keydown", (e) => { if (e.key === "Escape" && current) $(".back", detail).click(); });
// 설교 쪽으로 스크롤해 내려가면 카드가 뒷면(말씀)으로 휙 뒤집히고, 다시 올라오면 앞면으로
let scrolledToSermon = false;
scroller.addEventListener("scroll", () => {
  const y = scroller.scrollTop;
  pinned.classList.toggle("scrolled", y > 8);
  const h = card.offsetHeight; // 카드가 40% 정도 올라가면 뒤집기 (화면에 보이는 동안)
  const past = y > h * (scrolledToSermon ? 0.2 : 0.4);
  if (past === scrolledToSermon) return;
  scrolledToSermon = past;
  if (isBack() !== past) flipTo((Math.round(angle / 180) + (past ? 1 : -1)) * 180);
}, { passive: true });


/* ---------- 말씀 카드 뒤집기 ---------- */
let angle = 0;

function setAngle(a, smooth = true) {
  angle = a;
  card.classList.toggle("dragging", !smooth);
  card.style.transform = `rotateY(${a}deg)`;
  // 빛 반사가 회전에 따라 카드 위를 지나가도록
  const g = `${-60 + 60 * (1 - Math.cos((a * Math.PI) / 180))}%`;
  glares.forEach((el) => el.style.setProperty("--glare", g));
}
const isBack = () => Math.abs(Math.round(angle / 180)) % 2 === 1;
const flipTo = (a) => { peekAnim?.cancel(); setAngle(a); };
const flip = () => flipTo((Math.round(angle / 180) + 1) * 180);

let peekAnim = null;
function peek(delay) {
  if (reduceMotion) return;
  peekAnim = card.animate(
    [{ transform: "rotateY(0)" }, { transform: "rotateY(-28deg)", offset: 0.45 }, { transform: "rotateY(6deg)", offset: 0.8 }, { transform: "rotateY(0)" }],
    { duration: 1300, delay, easing: "ease-in-out" }
  );
}

let drag = null;
card.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  peekAnim?.cancel();
  drag = { x: e.clientX, y: e.clientY, start: angle, t: e.timeStamp, last: e.clientX, v: 0, moved: false };
});
card.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.moved) {
    if (Math.abs(dx) < 6) { if (Math.abs(dy) > 10) drag = null; return; }
    drag.moved = true;
    card.setPointerCapture(e.pointerId);
  }
  const dt = Math.max(1, e.timeStamp - drag.t);
  drag.v = (e.clientX - drag.last) / dt;
  drag.last = e.clientX;
  drag.t = e.timeStamp;
  const k = 200 / card.offsetWidth; // 카드 너비만큼 끌면 약 200°
  setAngle(drag.start + dx * k, false);
});
const endDrag = () => {
  if (!drag) return;
  const { moved, v } = drag;
  drag = null;
  if (!moved) return flip();
  const k = 200 / card.offsetWidth;
  const projected = angle + v * k * 220;
  let target = Math.round(projected / 180) * 180;
  target = Math.max(Math.min(target, angle + 180), angle - 180);
  flipTo(Math.round(target / 180) * 180);
};
card.addEventListener("pointerup", endDrag);
card.addEventListener("pointercancel", endDrag);
card.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
  if (e.key === "ArrowLeft") flipTo((Math.round(angle / 180) - 1) * 180);
  if (e.key === "ArrowRight") flip();
});

/* ---------- 설교 영상 + AI 요약 ---------- */
const sermonCache = new Map();
function fetchSermon(n) {
  if (!sermonCache.has(n)) {
    sermonCache.set(n, fetch(`sermon/day${n}.md`, { cache: "no-cache" })
      .then((r) => (r.ok ? r.text() : null))
      .catch(() => null));
  }
  return sermonCache.get(n);
}

async function loadSermon(d) {
  const md = await fetchSermon(d.n);
  if (current !== d) return;
  const parsed = md && parseSermon(md);
  if (!parsed || (!parsed.videoId && !parsed.html)) {
    sermonEl.innerHTML = `<p class="sermon-pending">설교 영상과 요약은 ${d.label} 새벽예배 후에 올라옵니다.</p>`;
    return;
  }
  let html = "";
  if (parsed.videoId) {
    html += `<div class="video" style="background-image:url(https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg)"></div>`;
  }
  if (parsed.html) html += `<article class="summary">${parsed.html}</article>`;
  sermonEl.innerHTML = html;

  if (parsed.videoId) {
    // 열리는 애니메이션이 끝난 뒤에 iframe을 붙여 전환을 매끄럽게 유지
    await (anim?.finished.catch(() => {}) ?? null);
    if (current !== d) return;
    const box = $(".video", sermonEl);
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${parsed.videoId}?rel=0&playsinline=1`;
    f.title = `${d.label} ${d.title} 설교 영상`;
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.allowFullscreen = true;
    f.onload = () => f.classList.add("ready");
    box.append(f);
  }
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function inline(s) {
  let t = esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // "우리의 탄식: ..." 처럼 앞머리 소제목은 굵게
  return t.replace(/^([^:<]{1,24}):\s+/, "<strong>$1</strong> ");
}
function parseSermon(md) {
  let videoId = null, html = "", list = false;
  const closeList = () => { if (list) { html += "</ul>"; list = false; } };
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const yt = !videoId && line.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    if (yt) { videoId = yt[1]; continue; }
    let m;
    if ((m = line.match(/^#\s+(.*)/))) { closeList(); html += `<p class="summary-label">${esc(m[1])}</p>`; }
    else if ((m = line.match(/^#{2,}\s+(.*)/))) { closeList(); html += `<h3>${inline(m[1])}</h3>`; }
    else if ((m = line.match(/^[-*]\s+(.*)/))) { if (!list) { html += "<ul>"; list = true; } html += `<li>${inline(m[1])}</li>`; }
    else { closeList(); html += `<p>${inline(line)}</p>`; }
  }
  closeList();
  return { videoId, html };
}

/* ---------- 미리 불러오기 ---------- */
(window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(() => {
  DAYS.forEach((d) => {
    for (const s of ["f", "r"]) new Image().src = `assets/cards/day${d.n}_${s}.webp`;
    fetchSermon(d.n);
  });
});

if (dayFromHash()) open(dayFromHash(), false);
