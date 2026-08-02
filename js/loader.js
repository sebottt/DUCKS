/* =============================================
   DUCKS ES — pantalla de carga inicial
   ---------------------------------------------
   Sin defer a proposito: tiene que engancharse al evento 'load'
   antes de que el navegador lo dispare. Se incluye igual en las 3
   paginas (index, privacidad, terminos); en las dos ultimas no se
   carga js/main.js, asi que esta logica no puede depender de el.
============================================= */
(function () {
  'use strict';

  var loader = document.getElementById('page-loader');
  if (!loader) return;

  // El sitio carga tan rapido que el loader apenas alcanza a verse:
  // se fuerza un minimo de tiempo en pantalla para que la animacion
  // se note, aunque los recursos ya hayan terminado antes.
  var MIN_DISPLAY_MS = 1800;
  var startTime = Date.now();
  var hidden = false;

  function hide() {
    if (hidden) return;
    hidden = true;
    loader.classList.add('page-loader--hidden');
    // Saca el loader del flujo tras el fade, para que no intercepte
    // clics ni quede estorbando a lectores de pantalla.
    loader.addEventListener('transitionend', function onEnd() {
      loader.removeEventListener('transitionend', onEnd);
      loader.style.display = 'none';
    });
  }

  function hideAfterMinimum() {
    var elapsed = Date.now() - startTime;
    var remaining = MIN_DISPLAY_MS - elapsed;
    if (remaining > 0) {
      setTimeout(hide, remaining);
    } else {
      hide();
    }
  }

  if (document.readyState === 'complete') {
    // La pagina ya termino de cargar (ej. viene de cache) antes de que
    // este script corriera: no tiene sentido esperar un 'load' que ya paso.
    hideAfterMinimum();
  } else {
    window.addEventListener('load', hideAfterMinimum);
    // Red de seguridad: si algun recurso nunca dispara 'load' (imagen
    // rota, red lenta), que el usuario no quede atrapado detras del loader.
    setTimeout(hide, 8000);
  }
})();
