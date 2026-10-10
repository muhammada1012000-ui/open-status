(function () {
  const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const cfg = window.CONFIG;

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const fmt = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const suffix = h >= 12 && h < 24 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
  };

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Current weekday index and minutes-since-midnight in the business's time zone.
  function nowInZone() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: cfg.timeZone,
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
  function weeklyIntervals() {
    const out = [];
    DAYS.forEach((day, i) => {
      (cfg.hours[day] || []).forEach(([open, close]) => {
        const start = i * 1440 + toMinutes(open);
        let end = i * 1440 + toMinutes(close);
        if (end <= start) end += 1440; // overnight
        out.push({ start, end, day: i, open, close });
      });
    });
    return out;
  }

  const WEEK = 7 * 1440;

  function status() {
    const { day, minutes } = nowInZone();
    const now = day * 1440 + minutes;
    const intervals = weeklyIntervals();

    // Check this week and the wrap-around from last week (overnight on Saturday).
    for (const iv of intervals) {
      for (const shift of [0, -WEEK]) {
        if (now >= iv.start + shift && now < iv.end + shift) {
          return { open: true, iv, minsLeft: iv.end + shift - now };
        }
      }
    }

    // Closed: find the next opening.
    let best = null;
    for (const iv of intervals) {
      let diff = iv.start - now;
      if (diff <= 0) diff += WEEK;
      if (!best || diff < best.diff) best = { iv, diff };
    }
    return { open: false, next: best };
  }

  function describeWait(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
  }

  function render() {
    const s = status();
    const statusEl = document.getElementById("status");
    const text = document.getElementById("status-text");
    const next = document.getElementById("next-change");

    statusEl.classList.toggle("open", s.open);
    statusEl.classList.toggle("closed", !s.open);

    if (s.open) {
      text.textContent = "We're open";
      next.textContent = s.minsLeft <= 60
        ? `Closing soon — at ${fmt(s.iv.close)} (in ${describeWait(s.minsLeft)})`
        : `Open until ${fmt(s.iv.close)}`;
    } else if (s.next) {
      const today = nowInZone().day;
      const when = s.next.iv.day === today && s.next.diff < 1440
        ? "today"
        : s.next.iv.day === (today + 1) % 7 && s.next.diff < 2880
          ? "tomorrow"
          : cap(DAYS[s.next.iv.day]);
      text.textContent = "Sorry, we're closed";
      next.textContent = `Opens ${when} at ${fmt(s.next.iv.open)}`;
    } else {
      text.textContent = "Sorry, we're closed";
      next.textContent = "No opening hours set.";
    }

    document.getElementById("clock").textContent =
      "Local time: " +
      new Intl.DateTimeFormat("en-US", {
        timeZone: cfg.timeZone,
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date());
  }

  function renderHours() {
    const table = document.getElementById("hours");
    const today = nowInZone().day;
    // Show Monday first.
    const order = [1, 2, 3, 4, 5, 6, 0];
    table.innerHTML = order
      .map((i) => {
        const ranges = cfg.hours[DAYS[i]] || [];
        const label = ranges.length
          ? ranges.map(([o, c]) => `${fmt(o)} – ${fmt(c)}`).join(", ")
          : "Closed";
        return `<tr class="${i === today ? "today" : ""}"><th>${cap(DAYS[i])}</th><td>${label}</td></tr>`;
      })
      .join("");
  }

  document.title = `${cfg.businessName} — Are We Open?`;
  document.getElementById("business-name").textContent = cfg.businessName;
  document.getElementById("tz-label").textContent = cfg.timeZone;

  renderHours();
  render();
  setInterval(() => {
    render();
    renderHours();
  }, 30 * 1000);
})();
