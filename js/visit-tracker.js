/* =============================================
   DUCKS ES — contador global de visitas
   ---------------------------------------------
   Cuenta una visita por sesion de navegador (sessionStorage, no
   cookies), no por cada recarga/pagina interna. Se incluye en las
   3 paginas reales (index/privacidad/terminos); si sessionStorage
   no esta disponible, simplemente no cuenta esta visita en vez de
   romper la pagina.
============================================= */
(function () {
  'use strict';

  try {
    if (sessionStorage.getItem('ducks_visit_tracked')) return;
    sessionStorage.setItem('ducks_visit_tracked', '1');
  } catch (e) {
    return;
  }

  fetch('/api/track_visit', { method: 'POST' }).catch(() => {});
})();
