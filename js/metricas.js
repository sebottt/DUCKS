/* =============================================
   DUCKS ES — pagina de metricas en vivo
   ---------------------------------------------
   Lee el contador real desde /api/get_visits (Supabase) y lo anima.
   Vuelve a consultar cada 20s para que se sienta "en vivo" sin
   necesidad de recargar la pagina.
============================================= */
(function () {
  'use strict';

  const numberEl = document.getElementById('visitor-count');
  const errorEl = document.getElementById('visitor-count-error');
  if (!numberEl) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastValue = null;

  function animateTo(target) {
    if (prefersReduced || lastValue === null) {
      numberEl.textContent = target.toLocaleString('es-ES');
      lastValue = target;
      return;
    }
    const start = lastValue;
    const diff = target - start;
    const duration = 900;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      numberEl.textContent = current.toLocaleString('es-ES');
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        numberEl.textContent = target.toLocaleString('es-ES');
        lastValue = target;
        numberEl.classList.add('is-bump');
        setTimeout(() => numberEl.classList.remove('is-bump'), 200);
      }
    }
    requestAnimationFrame(tick);
  }

  async function loadVisits() {
    try {
      const res = await fetch('/api/get_visits');
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      const total = Number(data.total) || 0;
      if (total !== lastValue) animateTo(total);
      if (errorEl) errorEl.hidden = true;
    } catch (e) {
      if (lastValue === null) numberEl.textContent = '—';
      if (errorEl) errorEl.hidden = false;
    }
  }

  /* El refresco solo corre cuando la pestana esta a la vista. Antes
     seguia consultando cada 20s en pestanas olvidadas en segundo plano:
     gastaba bateria y datos del visitante, y disparaba invocaciones de
     funcion en Vercel sin que nadie estuviera mirando el contador. */
  const REFRESCO = 20000;
  let temporizador = null;

  function arrancar() {
    if (temporizador !== null) return;
    temporizador = setInterval(loadVisits, REFRESCO);
  }

  function parar() {
    if (temporizador === null) return;
    clearInterval(temporizador);
    temporizador = null;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      parar();
    } else {
      loadVisits();  // al volver, refresca ya en vez de esperar 20s
      arrancar();
    }
  });

  loadVisits();
  if (!document.hidden) arrancar();
})();
