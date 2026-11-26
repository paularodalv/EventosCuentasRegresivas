// Static countdowns (GitHub Pages, serverless).
// Each ISO date includes its own offset (+01:00, -05:00…), so all
// visitors count down to the exact same instant regardless of their timezone.
//
// Elements recognized by this script:
// [data-countdown] Main page countdown (see README).
//   - data-target: start date or main target date (ISO).
//   - data-end (optional): end date; if provided, counts down to closing
//     once data-target has passed, and marks as finished after data-end.
// [data-until] Short status label anywhere on the page.
//   - data-until: start date (ISO).
//   - data-until-end (optional): end date (ISO) to automatically transition
//     from "Starts in..." -> "Active · Ends in..." -> "Closed".
// [data-soonest] Container showing the nearest upcoming date
// among all [data-soonest-source] elements on the page.
(() => {
  const pad = n => String(n).padStart(2, "0");
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
 
  const parse = text => (text ? Date.parse(text) : NaN);
 
  function split(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    return {
      d: Math.floor(total / 86400),
      h: Math.floor((total % 86400) / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60
    };
  }
 
  function short(ms) {
    const t = split(ms);
    if (t.d >= 1) return plural(t.d, "day", "days");
    if (t.h >= 1) return `${t.h} h ${pad(t.m)} min`;
    return `${t.m} min ${pad(t.s)} s`;
  }
 
  // "2026-12-10T10:00:00+01:00" -> "10 Dec 2026 · 10:00 (GMT+1)", parsed directly from the string.
  function zoneLabel(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}(?::?\d{2})?)$/.exec(iso || "");
    if (!m) return "";
    const [, y, mo, d, hh, mm, off] = m;
    const month = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" })
      .format(new Date(Date.UTC(+y, +mo - 1, +d))).replace(".", "");
    let gmt = "GMT";
    if (off !== "Z") {
      const sign = off[0];
      const hours = String(parseInt(off.slice(1, 3), 10));
      const mins = off.replace(":", "").slice(3, 5);
      gmt += sign + hours + (mins && mins !== "00" ? ":" + mins : "");
    }
    return `${+d} ${month} ${y} · ${hh}:${mm} (${gmt})`;
  }
 
  function localLabel(time) {
    try {
      return new Intl.DateTimeFormat("en", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short"
      }).format(new Date(time)).replace(/\./g, "");
    } catch (e) { return ""; }
  }
 
  // ---------- Main countdowns ----------
  const mains = [...document.querySelectorAll("[data-countdown]")].map(root => {
    const startTime = parse(root.dataset.target);
    const endTime = parse(root.dataset.end);
    const hasWindow = Number.isFinite(startTime) && Number.isFinite(endTime);
    const q = sel => root.querySelector(sel);
    const item = {
      root,
      startTime,
      endTime,
      hasWindow,
      d: q("[data-days]"), h: q("[data-hours]"), m: q("[data-minutes]"), s: q("[data-seconds]"),
      message: q("[data-message]"),
      title: q("[data-title]"),
      titleRunning: q("[data-title]") ? q("[data-title]").textContent : "",
      state: null
    };
    const zone = q("[data-zone-date]");
    const local = q("[data-local-date]");
    const infoDate = hasWindow ? endTime : startTime;
    const infoIso = hasWindow ? root.dataset.end : root.dataset.target;
    if (Number.isFinite(infoDate)) {
      if (zone) zone.textContent = zoneLabel(infoIso);
      if (local) {
        const text = localLabel(infoDate);
        if (text) local.textContent = "Your time: " + text; else local.hidden = true;
      }
    }
    return item;
  });
 
  function applyState(item, nextState) {
    if (item.state === nextState) return;
    item.state = nextState;
    const isFinished = nextState === "finished";
    const isActive = nextState === "active";
 
    item.root.classList.toggle("is-finished", isFinished);
    item.root.classList.toggle("is-active", isActive);
    item.root.dataset.state = nextState;
 
    item.root.querySelectorAll("[data-show-when]").forEach(el => {
      el.hidden = el.dataset.showWhen !== nextState && !(nextState === "running" && el.dataset.showWhen === "upcoming");
    });
 
    if (item.title) {
      if (isFinished) {
        item.title.textContent = item.root.dataset.finishedTitle || item.titleRunning;
      } else if (isActive && item.root.dataset.activeTitle) {
        item.title.textContent = item.root.dataset.activeTitle;
      } else {
        item.title.textContent = item.titleRunning;
      }
    }
  }
 
  function renderMain(item, now) {
    if (!Number.isFinite(item.startTime)) {
      if (item.message) item.message.textContent = "Invalid target date.";
      return;
    }
 
    let targetTime = item.startTime;
    let nextState = "running";
    let statusMsg = "";
 
    if (item.hasWindow) {
      if (now < item.startTime) {
        targetTime = item.startTime;
        nextState = "upcoming";
        statusMsg = item.root.dataset.upcoming || "";
      } else if (now <= item.endTime) {
        targetTime = item.endTime;
        nextState = "active";
        statusMsg = item.root.dataset.active || "";
      } else {
        targetTime = item.endTime;
        nextState = "finished";
        statusMsg = item.root.dataset.finished || "It has ended!";
      }
    } else if (now >= item.startTime) {
      nextState = "finished";
      statusMsg = item.root.dataset.finished || "The time has come!";
    }
 
    const remaining = targetTime - now;
    const t = split(remaining);
 
    if (item.d) {
      item.d.textContent = pad(t.d);
      item.d.classList.toggle("is-long", t.d > 99);
    }
    if (item.h) item.h.textContent = pad(t.h);
    if (item.m) item.m.textContent = pad(t.m);
    if (item.s) item.s.textContent = pad(t.s);
    if (item.message) item.message.textContent = statusMsg;
 
    applyState(item, nextState);
  }
 
  // ---------- Short labels [data-until] ----------
  const chips = [...document.querySelectorAll("[data-until]")].map(el => ({
    el,
    start: parse(el.dataset.until),
    end: parse(el.dataset.untilEnd),
    label: el.dataset.untilLabel || "Starts in {t}",
    activeLabel: el.dataset.untilActive || "Active · Ends in {t}",
    done: el.dataset.untilDone || "Closed"
  }));
 
  function renderChip(c, now) {
    if (!Number.isFinite(c.start)) { c.el.hidden = true; return; }
    const hasEnd = Number.isFinite(c.end);
 
    if (now < c.start) {
      c.el.dataset.phase = "upcoming";
      c.el.textContent = c.label.replace("{t}", short(c.start - now));
    } else if (hasEnd && now <= c.end) {
      c.el.dataset.phase = "active";
      c.el.textContent = c.activeLabel.replace("{t}", short(c.end - now));
    } else if (!hasEnd) {
      c.el.dataset.phase = "done";
      c.el.textContent = c.done;
    } else {
      c.el.dataset.phase = "finished";
      c.el.textContent = c.done;
    }
  }
 
  // ---------- Nearest upcoming date [data-soonest] ----------
  const soonestBox = document.querySelector("[data-soonest]");
  const sources = [...document.querySelectorAll("[data-soonest-source]")]
    .map(el => ({ name: el.dataset.name || "", time: parse(el.dataset.target) }))
    .filter(s => Number.isFinite(s.time));
 
  function renderSoonest(now) {
    if (!soonestBox) return;
    const next = sources.filter(s => s.time > now).sort((a, b) => a.time - b.time)[0];
    if (!next) { soonestBox.hidden = true; return; }
    soonestBox.hidden = false;
    const t = split(next.time - now);
    const set = (sel, v) => { const el = soonestBox.querySelector(sel); if (el) el.textContent = v; };
    set("[data-soonest-name]", next.name);
    set("[data-soonest-days]", pad(t.d));
    set("[data-soonest-hours]", pad(t.h));
    set("[data-soonest-minutes]", pad(t.m));
    set("[data-soonest-seconds]", pad(t.s));
  }
 
  function tick() {
    const now = Date.now();
    mains.forEach(i => renderMain(i, now));
    chips.forEach(c => renderChip(c, now));
    renderSoonest(now);
  }
 
  if (!mains.length && !chips.length && !soonestBox) return;
  tick();
  setInterval(tick, 250);
})();
 
