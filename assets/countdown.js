// Cuenta atrás estática: la fecha ISO incluye su propio desplazamiento UTC.
// Todos los visitantes cuentan hacia el mismo instante, independientemente
// de la zona horaria configurada en su dispositivo.
(() => {
  const root = document.querySelector("[data-countdown]");
  if (!root) return;

  const targetText = root.dataset.target;
  const targetTime = Date.parse(targetText);
  const labels = {
    days: root.querySelector("[data-days]"),
    hours: root.querySelector("[data-hours]"),
    minutes: root.querySelector("[data-minutes]"),
    seconds: root.querySelector("[data-seconds]")
  };
  const message = root.querySelector("[data-message]");

  if (!Number.isFinite(targetTime)) {
    if (message) message.textContent = "La fecha de destino no es válida.";
    return;
  }

  const pad = value => String(value).padStart(2, "0");

  let timer = null;

  function render() {
    const remaining = targetTime - Date.now();

    if (remaining <= 0) {
      Object.values(labels).forEach(el => { if (el) el.textContent = "00"; });
      if (message) message.textContent = root.dataset.finished || "¡Ha llegado el momento!";
      clearInterval(timer);
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (labels.days) labels.days.textContent = String(days);
    if (labels.hours) labels.hours.textContent = pad(hours);
    if (labels.minutes) labels.minutes.textContent = pad(minutes);
    if (labels.seconds) labels.seconds.textContent = pad(seconds);
  }

  render();
  timer = setInterval(render, 250);
})();
