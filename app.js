(function () {
  const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const WEEK = 7 * 1440;
  const cfg = window.CONFIG;

  let filter = "all";
  let query = "";

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const fmt = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const suffix = h >= 12 && h < 24 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
  };

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Current weekday index and minutes-since-midnight in a time zone.
  function nowInZone(timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return {
      day: DAYS.indexOf(get("weekday").toLowerCase()),
      minutes: Number(get("hour")) * 60 + Number(get("minute")),
    };
  }

  // All opening intervals for the week, as absolute minutes from Sunday 00:00.
  function weeklyIntervals(hours) {
    const out = [];
    DAYS.forEach((day, i) => {
      (hours[day] || []).forEach(([open, close]) => {
        const start = i * 1440 + toMinutes(open);
        let end = i * 1440 + toMinutes(close);
        if (end <= start) end += 1440; // past midnight
        out.push({ start, end, day: i, open, close });
      });
    });
    return out;
  }

  function statusOf(r) {
    const tz = r.timeZone || cfg.timeZone;
    const { day, minutes } = nowInZone(tz);
    const now = day * 1440 + minutes;
    const intervals = weeklyIntervals(r.hours || {});

    // Include last week's shift so Saturday-night hours carry into Sunday.
    for (const iv of intervals) {
      for (const shift of [0, -WEEK]) {
        if (now >= iv.start + shift && now < iv.end + shift) {
          return { open: true, today: day, iv, minsLeft: iv.end + shift - now };
        }
      }
    }

    let next = null;
    for (const iv of intervals) {
      let diff = iv.start - now;
      if (diff <= 0) diff += WEEK;
      if (!next || diff < next.diff) next = { iv, diff };
    }
    return { open: false, today: day, next };
  }

  function describeWait(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
  }

  function statusLine(s) {
    if (s.open) {
      return s.minsLeft <= 60
        ? { label: "Closing soon", cls: "soon", detail: `Closes at ${fmt(s.iv.close)} · in ${describeWait(s.minsLeft)}` }
        : { label: "Open now", cls: "open", detail: `Open until ${fmt(s.iv.close)}` };
    }
    if (!s.next) return { label: "Closed", cls: "closed", detail: "No opening hours listed" };
    const { iv, diff } = s.next;
    const when =
      iv.day === s.today && diff < 1440 ? "today"
      : iv.day === (s.today + 1) % 7 && diff < 2880 ? "tomorrow"
      : cap(DAYS[iv.day]);
    return { label: "Closed", cls: "closed", detail: `Opens ${when} at ${fmt(iv.open)}` };
  }

  function hoursLabel(ranges) {
    return ranges && ranges.length ? ranges.map(([o, c]) => `${fmt(o)} – ${fmt(c)}`).join(", ") : "Closed";
  }

  function card(r, s, idx) {
    const line = statusLine(s);
    const todayRanges = (r.hours || {})[DAYS[s.today]];
    const order = [1, 2, 3, 4, 5, 6, 0];
    const rows = order
      .map((i) => `<tr class="${i === s.today ? "is-today" : ""}"><th>${cap(DAYS[i])}</th><td>${esc(hoursLabel((r.hours || {})[DAYS[i]]))}</td></tr>`)
      .join("");

    const meta = [];
    if (r.address) meta.push(`<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(r.address)}</li>`);
    if (r.phone) meta.push(`<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg><a href="tel:${esc(r.phone.replace(/\s/g, ""))}">${esc(r.phone)}</a></li>`);

    return `
      <article class="card ${idx === 0 ? "featured" : ""}">
        <div class="card-top">
          <div>
            <h2>${esc(r.name)}</h2>
            ${r.cuisine ? `<p class="cuisine">${esc(r.cuisine)}</p>` : ""}
          </div>
          <span class="badge ${line.cls}"><span class="dot"></span>${line.label}</span>
        </div>
        <p class="detail">${esc(line.detail)}</p>
        <dl class="today">
          <dt>Today</dt><dd>${esc(hoursLabel(todayRanges))}</dd>
        </dl>
        ${meta.length ? `<ul class="meta">${meta.join("")}</ul>` : ""}
        <details>
          <summary>Weekly hours</summary>
          <table>${rows}</table>
        </details>
      </article>`;
  }

  function render() {
    const restaurants = cfg.restaurants || [];
    const items = restaurants.map((r, i) => ({ r, s: statusOf(r), i }));
    const openCount = items.filter((x) => x.s.open).length;

    document.getElementById("summary").innerHTML =
      `<span class="summary-dot ${openCount ? "open" : "closed"}"></span>` +
      `<strong>${openCount} of ${restaurants.length}</strong> restaurant${restaurants.length === 1 ? "" : "s"} open now`;

    const q = query.trim().toLowerCase();
    const shown = items.filter(({ r, s }) => {
      if (filter === "open" && !s.open) return false;
      if (filter === "closed" && s.open) return false;
      if (!q) return true;
      return [r.name, r.cuisine, r.address].filter(Boolean).some((v) => v.toLowerCase().includes(q));
    });

    // Remember which cards had their weekly hours expanded.
    const grid = document.getElementById("grid");
    const expanded = new Set(
      [...grid.querySelectorAll("article")].filter((a) => a.querySelector("details").open).map((a) => a.dataset.i)
    );

    grid.innerHTML = shown.map(({ r, s, i }) => card(r, s, i).replace("<article ", `<article data-i="${i}" `)).join("");
    grid.querySelectorAll("article").forEach((a) => {
      if (expanded.has(a.dataset.i)) a.querySelector("details").open = true;
    });
    document.getElementById("empty").hidden = shown.length > 0;

    document.getElementById("clock").textContent = new Intl.DateTimeFormat("en-US", {
      timeZone: cfg.timeZone,
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date());
  }

  document.title = `${cfg.siteName} — Opening Hours`;
  document.getElementById("site-name").textContent = cfg.siteName;
  document.getElementById("footer-name").textContent = cfg.siteName;
  document.querySelector(".brand-mark").textContent = cfg.siteName.charAt(0);
  document.getElementById("tagline").textContent = cfg.tagline || "";
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("tz-note").textContent = `All times in ${cfg.timeZone.replace(/_/g, " ")}`;

  document.getElementById("search").addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });
  document.querySelectorAll(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("active", b === btn));
      render();
    })
  );

  render();
  setInterval(render, 30 * 1000);
})();
