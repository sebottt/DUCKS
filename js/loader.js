
(function () {
  'use strict';

  var loader = document.getElementById('page-loader');
  if (!loader) return;

  var hidden = false;

  function hide() {
    if (hidden) return;
    hidden = true;
    loader.classList.add('page-loader--hidden');
    
    
    loader.addEventListener('transitionend', function onEnd() {
      loader.removeEventListener('transitionend', onEnd);
      loader.style.display = 'none';
    });
  }

  if (document.readyState === 'complete') {
    
    
    hide();
  } else {
    window.addEventListener('load', hide);
    
    
    setTimeout(hide, 8000);
  }
})();
