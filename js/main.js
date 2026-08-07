/* =============================================
   DUCKS ES — main.js
   Sin GSAP/ScrollTrigger — CSS animations +
   IntersectionObserver nativo (cero RAF loops)
============================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     1. NAVBAR — Sombra al hacer scroll
  ============================================= */
  (function initNavbarScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* =============================================
     2. MENÚ MÓVIL — Toggle hamburger
  ============================================= */
  (function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu   = document.getElementById('primary-nav');
    if (!toggle || !menu) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú de navegación');
      menu.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Abrir menú de navegación' : 'Cerrar menú de navegación');
      menu.classList.toggle('is-open', !isOpen);
    });

    menu.querySelectorAll('.navbar__link').forEach(link => link.addEventListener('click', close));
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        close();
        toggle.focus();
      }
    });
  })();

  /* =============================================
     3. SCROLL SPY — Sección activa en navbar
  ============================================= */
  (function initScrollSpy() {
    const sectionIds = ['hero', 'metricas', 'redes-ducks', 'redes-duckes', 'sorteo', 'ganadores', 'staff'];
    const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const navLinks   = document.querySelectorAll('.navbar__link');
    if (!sections.length) return;

    function updateActiveSection() {
      let currentId = 'hero';
      const trigger = window.innerHeight * 0.45;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= trigger) currentId = section.id;
      }
      navLinks.forEach(link => {
        link.classList.toggle('navbar__link--active', link.getAttribute('href') === `#${currentId}`);
      });
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();
  })();

  /* =============================================
     4. ANIMACIONES DE ENTRADA — IntersectionObserver
     Reemplaza GSAP ScrollTrigger (cero RAF loops)
  ============================================= */
  (function initAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Hero: animación CSS al cargar (sin JS) ---
    // Las clases .anim-hero-* se añaden aquí para disparar los @keyframes
    function triggerHeroAnimation() {
      const heroEls = document.querySelectorAll('.site-header, .navbar__brand, .navbar__item, .hero__text > *, .hero__illustration-img');
      heroEls.forEach((el, i) => {
        el.style.animationDelay = `${i * 0.08}s`;
        el.classList.add('anim-hero-in');
      });
    }

    // Si hay pantalla de carga, esperar a que loader.js avise que va a
    // ocultarse (evento 'ducks:loader-hide'): si se dispara en DOMContentLoaded
    // como antes, la animación termina oculta detrás del loader y el usuario
    // nunca la ve. Sin loader (no debería pasar en las páginas actuales),
    // se dispara de inmediato como antes.
    if (document.getElementById('page-loader')) {
      document.addEventListener('ducks:loader-hide', triggerHeroAnimation, { once: true });
    } else {
      triggerHeroAnimation();
    }

    if (prefersReduced) return;

    // --- Secciones y tarjetas: IntersectionObserver ---
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Solo una vez — no bucle
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('[data-animate="fade-up"], [data-animate="fade-left"], .section:not(.section--hero)').forEach(el => {
      observer.observe(el);
    });
  })();

  /* =============================================
     5. STAFF CARDS HOVER — CSS transform via JS
     (sin GSAP — solo clases CSS)
  ============================================= */
  (function initStaffCardHover() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    document.querySelectorAll('.staff-card__inner').forEach(card => {
      const photo = card.querySelector('.staff-card__photo-wrap');
      if (!photo) return;
      card.addEventListener('mouseenter', () => {
        photo.style.transform = 'scale(1.15) rotate(5deg) translateY(-5px)';
      });
      card.addEventListener('mouseleave', () => {
        photo.style.transform = '';
      });
    });
  })();

  /* =============================================
     6. SOCIAL CARDS HOVER — CSS transform via JS
     (sin GSAP — solo clases CSS)
  ============================================= */
  (function initSocialCardHover() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    document.querySelectorAll('.social-card').forEach(card => {
      const icon = card.querySelector('.social-card__icon, .social-card__icon--img');
      if (!icon) return;
      card.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.25) rotate(-8deg) translateY(-15px)';
      });
      card.addEventListener('mouseleave', () => {
        icon.style.transform = '';
      });
    });
  })();

});




  /* =============================================
     7. MODAL Y FORMULARIO DE SORTEO
  ============================================= */
  (function initModalSorteo() {
    const btnOpen = document.getElementById('btn-sorteo');
    const modal = document.getElementById('modal-sorteo');
    const form = document.getElementById('form-sorteo');
    const statusDiv = document.getElementById('form-status');
    const btnSubmit = document.getElementById('btn-submit-sorteo');
    
    if (!btnOpen || !modal || !form) return;

    // Función auxiliar para obtener el ancho de la barra de scroll
    const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth;

    // Abrir Modal
    btnOpen.addEventListener('click', () => {
      const scrollbarWidth = getScrollbarWidth();
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      const header = document.querySelector('.site-header');
      if (header) header.style.paddingRight = `${scrollbarWidth}px`;
      
      document.body.style.overflow = 'hidden'; // Prevenir scroll
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      
      // Enfocar automáticamente el input después de abrirse
      setTimeout(() => {
        document.getElementById('nomb_usua').focus();
      }, 50);
    });

    // Cerrar Modal
    const closeModal = () => {
      /* Devolver el foco al boton que abrio el modal ANTES de ocultarlo.
         Marcar aria-hidden en un contenedor que todavia tiene el foco
         dentro deja a quien usa lector de pantalla apuntando a un
         elemento que para el ya no existe; Chrome lo bloquea y avisa
         por consola. Ademas es el comportamiento correcto: al cerrar,
         el foco vuelve a donde estaba, no al principio de la pagina. */
      if (modal.contains(document.activeElement)) btnOpen.focus();

      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      const header = document.querySelector('.site-header');
      if (header) header.style.paddingRight = '';
      
      setTimeout(() => {
        form.reset();
        statusDiv.textContent = '';
        statusDiv.className = 'form-status';
      }, 300);
    };

    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Enviar Formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        nomb_usua: formData.get('nomb_usua').trim(),
        come_usua: formData.get('come_usua').trim()
      };

      // Validación extra
      if (!data.nomb_usua.startsWith('@')) {
        statusDiv.textContent = 'El nickname debe comenzar con @';
        statusDiv.className = 'form-status error';
        return;
      }

      // Mismo filtro que aplica api/guardar.js, aqui solo para dar el aviso
      // en español sin esperar al viaje de ida y vuelta al servidor.
      if (/[<>"'&]/.test(data.nomb_usua)) {
        statusDiv.textContent = 'El nickname no puede contener < > " \' &';
        statusDiv.className = 'form-status error';
        return;
      }

      btnSubmit.disabled = true;
      btnSubmit.querySelector('.btn__text').textContent = 'Enviando...';
      statusDiv.textContent = '';

      try {
        const response = await fetch('/api/guardar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          statusDiv.textContent = '¡Participación registrada con éxito! 🦆';
          statusDiv.className = 'form-status success';
          setTimeout(() => {
            closeModal();
            btnSubmit.disabled = false;
            btnSubmit.querySelector('.btn__text').textContent = 'Participar Ahora';
          }, 2000);
        } else {
          throw new Error(result.error || 'Error al guardar');
        }
      } catch (err) {
        // Mostramos el error amigable que nos envía el servidor (ej: duplicados o validación)
        statusDiv.textContent = err.message || 'Hubo un error al conectar con el servidor.';
        statusDiv.className = 'form-status error';
        btnSubmit.disabled = false;
        btnSubmit.querySelector('.btn__text').textContent = 'Intentar de nuevo';
      }
    });
  })();

  // ==========================================
  // CONFETI EN SECCIÓN DE GANADORES
  // La libreria (17 KB) se descarga bajo demanda cuando la seccion
  // se acerca, no en la carga inicial: la mayoria de visitas no
  // llegan hasta aqui y no tienen por que pagar ese peso.
  // ==========================================
  const ganadoresSection = document.getElementById('ganadores');
  if (ganadoresSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const lanzarConfeti = () => {
      if (typeof confetti !== 'function') return;
      const duration = 1500; // Confeti corto y optimizado
      const end = Date.now() + duration;
      const colors = ['#fbbf24', '#f59e0b', '#395886', '#638ecb'];

      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      // Desconectar inmediatamente para ahorrar recursos
      observerInstance.disconnect();

      const script = document.createElement('script');
      script.src = './js/vendor/confetti.browser.js';
      script.onload = lanzarConfeti;
      document.head.appendChild(script);
      // rootMargin adelanta la descarga para que la libreria este lista
      // justo cuando la seccion entra de verdad en pantalla.
    }, { threshold: 0.1, rootMargin: '300px 0px' });

    observer.observe(ganadoresSection);
  }

  /* =============================================
     8. COVERFLOW DE GANADORES
     Coloca cada tarjeta en 3D segun su distancia a la
     que esta centrada: giro, retroceso, escala y velo.
     Los pasos se derivan del ancho real de la tarjeta,
     asi el mismo calculo sirve en movil sin duplicar
     numeros aqui y en el CSS.
  ============================================= */
  (function initCoverflowGanadores() {
    const escenario = document.querySelector('.ganadores-coverflow');
    if (!escenario) return;

    const items = Array.from(escenario.querySelectorAll('.coverflow__item'));
    if (!items.length) return;

    const controles = document.querySelector('.coverflow-controls');
    const btnPrev = controles && controles.querySelector('.carrusel-nav--prev');
    const btnNext = controles && controles.querySelector('.carrusel-nav--next');

    // El giro es FIJO por lado, no proporcional a la distancia: si se
    // multiplica, a partir del segundo nivel se pasa de 90 grados y la
    // tarjeta se da la vuelta — se ve el reverso y vuelve a ensancharse.
    const ANGULO = 45;      // grados de giro de las tarjetas laterales
    const ESCALA = 0.11;    // cuanto encoge cada nivel
    const VISIBLES = 2;     // niveles dibujados a cada lado

    // El anillo necesita mas tarjetas de las que se ven: dos huecos
    // ocultos a los lados para que el salto de la vuelta ocurra fuera
    // de la vista. Con pocos ganadores no hay suficientes, asi que se
    // repiten en pasadas completas — los clones son decorativos y
    // quedan fuera del lector de pantalla y de la tabulacion.
    const originales = items.slice();
    const MINIMO = VISIBLES * 2 + 3;
    const lista = escenario.querySelector('.coverflow__list');

    if (lista) {
      const pasadas = Math.ceil(MINIMO / originales.length);
      for (let p = 1; p < pasadas; p++) {
        originales.forEach((orig) => {
          const copia = orig.cloneNode(true);
          copia.setAttribute('aria-hidden', 'true');
          const enlace = copia.querySelector('a');
          if (enlace) enlace.tabIndex = -1;
          lista.appendChild(copia);
          items.push(copia);
        });
      }
    }

    const total = items.length;
    const TOPE_PASOS = Math.min(4, total - 1);  // techo de un deslizamiento rapido
    const PROYECCION = 90;   // ms de inercia que se proyectan al soltar
    const MINIMO_ARRASTRE = 0.28;  // fraccion de tarjeta para que cuente un arrastre lento
    const ESCALON = 85;      // ms de retraso por nivel en la entrada

    // Empieza por la de en medio para que el abanico salga simetrico
    let activa = Math.floor((total - 1) / 2);
    let offsPrevios = null;
    let pasoX = 0;
    let pasoZ = 0;
    let inicioX = null;
    let ultimoX = 0;
    let ultimoT = 0;
    let velocidad = 0;
    let arrastrado = false;

    // Medir provoca layout, asi que se hace solo al arrancar y al
    // redimensionar, no en cada repintado.
    function medir() {
      const ancho = items[0].offsetWidth || 230;
      pasoX = ancho * 0.52;
      pasoZ = ancho * 0.62;
    }

    // Distancia circular: la tarjeta que queda mas atras por un lado
    // reaparece por el otro, de ahi que el recorrido no tenga extremos.
    function desplazamiento(i) {
      let off = ((i - activa) % total + total) % total;   // 0 .. total-1
      if (off > total / 2) off -= total;                  // -total/2 .. total/2
      return off;
    }

    // `pasos` es cuantas posiciones se acaba de mover (0 al arrancar o
    // al redimensionar). Sirve para saber que tarjeta dio la vuelta: su
    // desplazamiento cambia en algo distinto de -pasos.
    // `escalonar` solo se usa en la entrada: reparte las tarjetas desde
    // el centro hacia fuera en vez de plantarlas todas a la vez.
    function pintar(pasos, escalonar) {
      // Pintar implica colocar las tarjetas, asi que el estado de partida
      // del CSS ya no aplica. Idempotente: puede llamarse siempre.
      escenario.classList.add('is-revealed');

      const offs = new Array(total);
      let minimo = Infinity;
      let maximo = -Infinity;

      for (let i = 0; i < total; i++) {
        const off = desplazamiento(i);
        offs[i] = off;
        if (Math.abs(off) <= VISIBLES) {
          if (off < minimo) minimo = off;
          if (off > maximo) maximo = off;
        }
      }

      // Centra el abanico realmente dibujado. Con pocas tarjetas no hay
      // suficientes para llenar ambos lados y sin esto queda descuadrado.
      const centrado = -((minimo + maximo) / 2) * pasoX;

      // Al dar la vuelta, una tarjeta salta de un extremo al otro. Si eso
      // se anima, cruza la pantalla por delante de todas; hay que moverla
      // sin transicion y devolversela despues del reflow.
      const saltan = new Array(total);
      let haySaltos = false;
      for (let i = 0; i < total; i++) {
        saltan[i] = offsPrevios !== null && (offs[i] - offsPrevios[i]) !== -pasos;
        if (saltan[i]) haySaltos = true;
      }

      for (let i = 0; i < total; i++) {
        const item = items[i];
        const off = offs[i];
        const dist = Math.abs(off);
        const fuera = dist > VISIBLES;
        const giro = off === 0 ? 0 : (off > 0 ? -ANGULO : ANGULO);

        if (saltan[i]) item.style.transition = 'none';
        if (escalonar) item.style.transitionDelay = (dist * ESCALON) + 'ms';

        item.style.transform =
          'translateX(' + (off * pasoX + centrado) + 'px) ' +
          'translateZ(' + (-dist * pasoZ) + 'px) ' +
          'rotateY(' + giro + 'deg) ' +
          'scale(' + Math.max(1 - dist * ESCALA, 0.4) + ')';

        item.style.zIndex = String(100 - dist);
        item.style.opacity = fuera ? '0' : '1';
        item.style.pointerEvents = fuera ? 'none' : 'auto';
        item.style.setProperty('--dim', dist === 0 ? '0' : String(Math.min(0.15 + dist * 0.12, 0.5)));
        item.classList.toggle('is-active', off === 0);
      }

      if (haySaltos) {
        void escenario.offsetWidth;  // fuerza el reflow antes de restaurar
        for (let i = 0; i < total; i++) {
          if (saltan[i]) items[i].style.transition = '';
        }
      }

      offsPrevios = offs;
    }

    // El indice da la vuelta en los dos sentidos: no hay principio ni final.
    // El movimiento se reduce al camino mas corto del anillo: ir 6 atras y
    // 2 adelante acaban igual, pero solo uno de los dos se ve natural.
    function irA(destino) {
      let pasos = ((destino - activa) % total + total) % total;
      if (pasos > total / 2) pasos -= total;
      if (pasos === 0) return;
      activa = ((activa + pasos) % total + total) % total;
      pintar(pasos);
    }

    items.forEach((item, i) => {
      const enlace = item.querySelector('a');
      if (!enlace) return;

      // Pulsar una tarjeta lateral la trae al centro en vez de
      // abrir el perfil; solo la centrada navega.
      enlace.addEventListener('click', (e) => {
        if (i !== activa || arrastrado) {
          e.preventDefault();
          irA(i);
        }
      });

      // Tabular por las tarjetas tambien mueve el coverflow,
      // para que el foco nunca quede en una tarjeta invisible.
      enlace.addEventListener('focus', () => irA(i));
    });

    escenario.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      irA(activa + (e.key === 'ArrowRight' ? 1 : -1));
      const enlace = items[activa].querySelector('a');
      if (enlace) enlace.focus();
    });

    if (btnPrev) btnPrev.addEventListener('click', () => irA(activa - 1));
    if (btnNext) btnNext.addEventListener('click', () => irA(activa + 1));

    /* Deslizar con el dedo o arrastrar con el raton.
       Cuantas tarjetas avanza depende del recorrido Y de la velocidad:
       un tiron rapido salta varias, un arrastre lento solo una. Se
       calcula proyectando la velocidad final unos milisegundos, que es
       como se comporta el desplazamiento por inercia del sistema. */
    escenario.addEventListener('pointerdown', (e) => {
      inicioX = e.clientX;
      ultimoX = e.clientX;
      ultimoT = e.timeStamp;
      velocidad = 0;
      arrastrado = false;
    });

    escenario.addEventListener('pointermove', (e) => {
      if (inicioX === null) return;
      const dt = e.timeStamp - ultimoT;
      if (dt > 0) {
        // Media exponencial: el tiron final pesa mas que el arrastre previo
        velocidad = 0.6 * ((e.clientX - ultimoX) / dt) + 0.4 * velocidad;
        ultimoX = e.clientX;
        ultimoT = e.timeStamp;
      }
      if (Math.abs(e.clientX - inicioX) > 10) arrastrado = true;
    }, { passive: true });

    // En window y no en el escenario: si se suelta el dedo fuera de la
    // seccion, el evento no llegaria y el arrastre quedaria a medias.
    window.addEventListener('pointerup', (e) => {
      if (inicioX === null) return;
      const dx = e.clientX - inicioX;
      // Si el dedo se paro antes de levantarse, no hay inercia que proyectar
      if (e.timeStamp - ultimoT > 120) velocidad = 0;
      inicioX = null;

      const recorrido = dx + velocidad * PROYECCION;
      let pasos = Math.round(-recorrido / pasoX);
      if (pasos === 0 && Math.abs(dx) > pasoX * MINIMO_ARRASTRE) pasos = dx < 0 ? 1 : -1;
      pasos = Math.max(-TOPE_PASOS, Math.min(TOPE_PASOS, pasos));
      if (pasos !== 0) irA(activa + pasos);

      // El click se dispara justo despues; dale un tick para que
      // lea `arrastrado` antes de limpiarlo.
      setTimeout(() => { arrastrado = false; }, 0);
    }, { passive: true });

    window.addEventListener('pointercancel', () => {
      inicioX = null;
      arrastrado = false;
    }, { passive: true });

    // Con un unico ganador no hay nada que recorrer (items ya incluye clones)
    if (controles && originales.length < 2) controles.classList.add('is-hidden');

    // El resize dispara en rafagas; agrupar en un frame evita medir y
    // repintar decenas de veces mientras se arrastra la ventana.
    let repintadoPendiente = false;
    window.addEventListener('resize', () => {
      if (repintadoPendiente) return;
      repintadoPendiente = true;
      requestAnimationFrame(() => {
        repintadoPendiente = false;
        medir();
        // Antes del reparto no se pinta: eso borraria el estado de
        // partida y las tarjetas apareceran ya colocadas.
        if (escenario.classList.contains('is-revealed')) pintar(0);
      });
    }, { passive: true });

    /* Entrada: las tarjetas parten apiladas y hundidas (estado que pone
       el CSS) y se abren en abanico desde el centro hacia fuera cuando
       la seccion entra en pantalla. Solo ocurre una vez. */
    function repartir() {
      pintar(0, true);
      // Los retrasos solo valen para la entrada: si se quedaran puestos,
      // cada movimiento posterior del carrusel arrastraria ese escalon.
      setTimeout(() => {
        for (const item of items) item.style.transitionDelay = '';
      }, ESCALON * VISIBLES + 700);
    }

    medir();

    if ('IntersectionObserver' in window) {
      const entrada = new IntersectionObserver((entries, obs) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        repartir();
      }, { threshold: 0.15 });
      entrada.observe(escenario);
    } else {
      repartir();
    }
  })();