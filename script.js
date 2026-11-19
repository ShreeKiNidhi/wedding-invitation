/* All text/content now lives in index.html. This file only handles behaviour. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const music = $("#music");

  /* ===== Falling petals ===== */
  if (!reduce) {
    const box = $("#petals"), count = innerWidth < 600 ? 9 : 16;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.style.cssText = `left:${Math.random() * 100}%;--dx:${Math.random() * 120 - 60}px;animation-duration:${9 + Math.random() * 9}s;animation-delay:${-Math.random() * 14}s;transform:scale(${.6 + Math.random() * .8})`;
      box.appendChild(p);
    }
  }
  document.addEventListener("visibilitychange", () => body.classList.toggle("paused", document.hidden));

  /* ===== Music ===== */
  const musicBtn = $("#musicBtn");
  function setMusic(on) {
    musicBtn.setAttribute("aria-pressed", on);
    musicBtn.setAttribute("aria-label", on ? "Pause background music" : "Play background music");
    musicBtn.textContent = on ? "♫" : "♪";
  }
  const startMusic = () => music.play().then(() => setMusic(true)).catch(() => setMusic(false));
  musicBtn.addEventListener("click", () => {
    if (music.paused) startMusic();
    else { music.pause(); setMusic(false); }
  });
  music.addEventListener("error", () => setMusic(false));

  /* ===== Flow: envelope -> "You are invited" -> video -> invitation ===== */
  const env = $("#envelope"), intro = $("#intro"), invited = $("#invited"), film = $("#film"), vid = $("#introVideo");
  let opened = false, invTimer = 0, filmTimers = [], stage = "envelope";

  env.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    env.classList.add("open");
    env.disabled = true;
    startMusic();
    intro.classList.add("opened");

    // sparkles + bokeh inside the card
    if (!reduce) {
      const sp = $("#cardSparks");
      for (let i = 0; i < 70; i++) {
        const d = document.createElement("i");
        d.className = "rs";
        d.style.cssText = `left:${Math.random() * 100}%;top:${45 + Math.random() * 55}%;--d:${1.6 + Math.random() * 2}s;--dl:${.3 + Math.random() * 2.6}s;--h:${80 + Math.random() * 160}px;width:${2 + Math.random() * 5}px;height:${2 + Math.random() * 5}px`;
        sp.appendChild(d);
      }
      for (let i = 0; i < 12; i++) {
        const d = document.createElement("i"), z = 18 + Math.random() * 34;
        d.className = "bk";
        d.style.cssText = `left:${Math.random() * 100}%;top:${40 + Math.random() * 50}%;--d:${4 + Math.random() * 3}s;--dl:${Math.random() * 3}s;--h:${120 + Math.random() * 140}px;width:${z}px;height:${z}px`;
        sp.appendChild(d);
      }
    }

    setTimeout(() => {
      intro.classList.add("done");
      startInvited();
      setTimeout(() => { intro.hidden = true; }, 1100);
    }, reduce ? 300 : 200);
  });

  function startInvited() {
    stage = "invited";
    body.classList.add("inviting");
    invited.hidden = false;
    void invited.offsetWidth;               // restart CSS transition
    invited.classList.add("on");
    invTimer = setTimeout(startFilm, reduce ? 1500 : 5200);   // auto-advance to video
  }
  $("#invitedSkip").addEventListener("click", startFilm);

  function startFilm() {
    if (stage !== "invited") return;
    stage = "film";
    clearTimeout(invTimer);
    body.classList.remove("inviting");
    body.classList.add("filming");
    film.hidden = false;
    void film.offsetWidth;
    film.classList.add("on");
    vid.play().catch(() => {});
    invited.classList.add("done");
    setTimeout(() => { invited.hidden = true; }, 1200);
    filmTimers.push(setTimeout(() => film.classList.add("t1"), 200));
    filmTimers.push(setTimeout(() => film.classList.add("t2"), reduce ? 300 : 4500));
  }

  function endFilm() {
    if (stage !== "film") return;
    stage = "main";
    filmTimers.forEach(clearTimeout);
    film.classList.add("done");
    body.classList.remove("locked", "filming");
    scrollTo(0, 0);
    $$("#main .reveal").forEach(observe);
    setTimeout(() => { film.hidden = true; vid.pause(); }, 1300);
  }
  $("#filmEnter").addEventListener("click", endFilm);
  $("#filmSkip").addEventListener("click", endFilm);

  /* ===== Menu ===== */
  const menu = $("#menu"), menuBtn = $("#menuBtn");
  const closeMenu = () => { menu.classList.remove("show"); menuBtn.setAttribute("aria-expanded", false); };
  menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", menu.classList.toggle("show")));
  menu.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });
  addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  /* ===== Countdown (target date is data-target on #timer in the HTML) ===== */
  const timer = $("#timer");
  const target = new Date(timer.dataset.target).getTime();
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };

  function setNum(el, v) {
    v = String(v).padStart(2, "0");
    if (el.textContent === v) return;
    el.textContent = v;
    if (!reduce) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
  }
  function tickCountdown() {
    const t = Math.max(0, target - Date.now());
    setNum(cd.d, Math.floor(t / 864e5));
    setNum(cd.h, Math.floor(t / 36e5) % 24);
    setNum(cd.m, Math.floor(t / 6e4) % 60);
    setNum(cd.s, Math.floor(t / 1e3) % 60);
    if (t === 0) { clearInterval(timerId); timer.hidden = true; $("#cd-done").hidden = false; }
  }
  const timerId = setInterval(tickCountdown, 1000);
  tickCountdown();

  /* ===== Confetti ===== */
  function confetti(el) {
    if (reduce) return;
    const r = el.getBoundingClientRect(), colors = ["#7A0F1A", "#B8872E", "#E6C77A", "#E8A317", "#C0394B"];
    for (let i = 0; i < 34; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;background:${colors[i % 5]};--x:${Math.random() * 360 - 180}px;--y:${Math.random() * 300 - 200}px;--r:${Math.random() * 720}deg`;
      body.appendChild(c);
      setTimeout(() => c.remove(), 1700);
    }
  }

  /* ===== Scratch cards ===== */
  function paintCover(ctx, w, h, style) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    if (style === "gold") { g.addColorStop(0, "#B8872E"); g.addColorStop(.5, "#F3DC9B"); g.addColorStop(1, "#B8872E"); }
    else { g.addColorStop(0, "#7A0F1A"); g.addColorStop(.5, "#B03040"); g.addColorStop(1, "#5A0A13"); }
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,.25)";
    for (let i = 0; i < 90; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, (style === "gold" ? 1.5 : 3) * (w / 400), 0, 7);
      ctx.fill();
    }
    ctx.fillStyle = style === "gold" ? "#5A0A13" : "#F6E3B0";
    ctx.textAlign = "center";
    ctx.font = `600 ${w / 15}px Georgia,serif`;
    ctx.fillText(style === "gold" ? "✦ Scratch here ✦" : "Scratch to reveal", w / 2, h / 2 + w / 45);
  }

  $$(".scratch-card").forEach(card => {
    const cv = $(".cover", card);
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    let w, h, last = null, drawing = false, started = false, done = false, lastCheck = 0;

    function resize() {
      const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      w = cv.width = Math.round(r.width * dpr);
      h = cv.height = Math.round(r.height * dpr);
      paintCover(ctx, w, h, cv.dataset.style);
    }
    new ResizeObserver(() => { if (!started && !done && cv.clientWidth) resize(); }).observe(cv);

    const pos = e => {
      const r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) * w / r.width, (e.clientY - r.top) * h / r.height];
    };
    function scratchLine(a, b) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.lineWidth = w / 9;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }

    cv.addEventListener("pointerdown", e => {
      if (done) return;
      drawing = started = true;
      cv.setPointerCapture(e.pointerId);
      last = pos(e);
      scratchLine(last, last);
      e.preventDefault();
    });
    cv.addEventListener("pointermove", e => {
      if (!drawing) return;
      const p = pos(e);
      scratchLine(last, p);
      last = p;
      const now = performance.now();
      if (now - lastCheck > 120) { lastCheck = now; check(); }
    });
    ["pointerup", "pointercancel"].forEach(ev =>
      cv.addEventListener(ev, () => { drawing = false; if (!done) check(); })
    );

    // reveal fully once 40% is scratched
    function check() {
      const px = ctx.getImageData(0, 0, w, h).data;
      let clear = 0, total = 0;
      for (let i = 3; i < px.length; i += 64) { total++; if (px[i] < 128) clear++; }
      if (clear / total >= .4) finish();
    }
    function finish() {
      done = true;
      drawing = false;
      cv.classList.add("gone");
      confetti(card);
      card.dispatchEvent(new CustomEvent("scratched", { bubbles: true }));
    }
  });

  // After the dates are scratched, show the countdown
  $("#save-date").addEventListener("scratched", () => {
    const sec = $("#countdown");
    if (!sec.hidden) return;
    sec.hidden = false;
    sec.classList.add("cd-in");
    // Scroll so the whole section (heading, revealed dates and countdown) sits in view, just below the nav
    setTimeout(() => {
      const top = $("#save-date").getBoundingClientRect().top + scrollY - $("#nav").offsetHeight;
      scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }, reduce ? 0 : 900);
  });

  /* ===== Scroll reveal ===== */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }), { threshold: .15 })
    : null;
  function observe(el) { io ? io.observe(el) : el.classList.add("in"); }
})();