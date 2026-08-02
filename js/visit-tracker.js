
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
