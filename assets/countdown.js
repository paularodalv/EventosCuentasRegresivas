// Cuentas regresivas estáticas (GitHub Pages, sin servidor).
// Cada fecha ISO lleva su propio desplazamiento (+01:00, -05:00…), así que todos
// los visitantes cuentan hacia el mismo instante, sea cual sea su zona horaria.
//
// Elementos que reconoce este script:
//   [data-countdown]      Contador principal de una página (ver README).
//   [data-until]          Texto corto "Faltan 5 días" en cualquier lugar.
//   [data-soonest]        Contenedor que muestra la fecha futura más cercana
//                         entre todos los [data-soonest-source] de la página.
(() => {
  const pad = n => String(n).padStart(2, "0");
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  const parse = text => Date.parse(text);

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
    if (t.d >= 1) return plural(t.d, "día", "días");
    if (t.h >= 1) return `${t.h} h ${pad(t.m)} min`;
    return `${t.m} min ${pad(t.s)} s`;
  }

  // "2026-12-10T10:00:00+01:00" -> "10 dic 2026 · 10:00 (GMT+1)", leído del propio texto.
  function zoneLabel(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}(?::?\d{2})?)$/.exec(iso || "");
    if (!m) return "";
    const [, y, mo, d, hh, mm, off] = m;
    const month = new Intl.DateTimeFormat("es", { month: "short", timeZone: "UTC" })
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
      return new Intl.DateTimeFormat("es", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short"
      }).format(new Date(time)).replace(/\./g, "");
    } catch (e) { return ""; }
  }

  // ---------- Contadores principales ----------
  const mains = [...document.querySelectorAll("[data-countdown]")].map(root => {
    const time = parse(root.dataset.target);
    const q = sel => root.querySelector(sel);
    const item = {
      root, time,
      d: q("[data-days]"), h: q("[data-hours]"), m: q("[data-minutes]"), s: q("[data-seconds]"),
      message: q("[data-message]"),
      title: q("[data-title]"),
      titleRunning: q("[data-title]") ? q("[data-title]").textContent : "",
      finished: false
    };
    const zone = q("[data-zone-date]");
    const local = q("[data-local-date]");
    if (Number.isFinite(time)) {
      if (zone) zone.textContent = zoneLabel(root.dataset.target);
      if (local) {
        const text = localLabel(time);
        if (text) local.textContent = "Tu hora: " + text; else local.hidden = true;
      }
    }
    return item;
  });

  function setFinished(item, value) {
    if (item.finished === value && item.initialised) return;
    item.initialised = true;
    item.finished = value;
    item.root.classList.toggle("is-finished", value);
    item.root.querySelectorAll("[data-show-when]").forEach(el => {
      el.hidden = el.dataset.showWhen !== (value ? "finished" : "running");
    });
    if (item.title) {
      item.title.textContent = value
        ? (item.root.dataset.finishedTitle || item.titleRunning)
        : item.titleRunning;
    }
  }

  function renderMain(item, now) {
    if (!Number.isFinite(item.time)) {
      if (item.message) item.message.textContent = "La fecha de destino no es válida.";
      return;
    }
    const remaining = item.time - now;
    const done = remaining <= 0;
    const t = split(remaining);
    if (item.d) {
      item.d.textContent = pad(t.d);
      item.d.classList.toggle("is-long", t.d > 99);
    }
    if (item.h) item.h.textContent = pad(t.h);
    if (item.m) item.m.textContent = pad(t.m);
    if (item.s) item.s.textContent = pad(t.s);
    if (item.message) {
      item.message.textContent = done ? (item.root.dataset.finished || "¡Ha llegado el momento!") : "";
    }
    setFinished(item, done);
  }

  // ---------- Textos cortos [data-until] ----------
  const chips = [...document.querySelectorAll("[data-until]")].map(el => ({
    el, time: parse(el.dataset.until),
    label: el.dataset.untilLabel || "Faltan {t}",
    done: el.dataset.untilDone || "Ya llegó"
  }));

  function renderChip(c, now) {
    if (!Number.isFinite(c.time)) { c.el.hidden = true; return; }
    const remaining = c.time - now;
    c.el.textContent = remaining <= 0 ? c.done : c.label.replace("{t}", short(remaining));
  }

  // ---------- Fecha más cercana [data-soonest] ----------
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
