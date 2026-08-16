
(function () {
  'use strict';

  var loader = document.getElementById('page-loader');
  if (!loader) return;

  
  
  
  
  var MIN_DISPLAY_MS = 500;
  var startTime = Date.now();
  var hidden = false;

  function hide() {
    if (hidden) return;
    hidden = true;
    
    
    
    document.dispatchEvent(new CustomEvent('ducks:loader-hide'));
    loader.classList.add('page-loader--hidden');
    
    
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

  
  
  
  
  if (document.readyState !== 'loading') {
    
    hideAfterMinimum();
  } else {
    document.addEventListener('DOMContentLoaded', hideAfterMinimum);
    
    
    setTimeout(hide, 8000);
  }
})();
