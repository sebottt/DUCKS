/* =============================================
   DUCK ES — main.js
   Animaciones con GSAP y ScrollTrigger,
   navbar scroll, menú móvil, scroll dots activos
============================================= */

'use strict';

document.addEventListener("DOMContentLoaded", (event) => {
  // Asegurarnos de que GSAP esté disponible
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP o ScrollTrigger no se cargaron correctamente.");
    return;
  }

  // Registrar ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  /* =============================================
     1. NAVBAR — Sombra al hacer scroll
  ============================================= */
  (function initNavbarScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

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

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';

      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Abrir menú de navegación' : 'Cerrar menú de navegación');
      menu.classList.toggle('is-open', !isOpen);
    });

    // Cerrar menú al hacer click en un link
    menu.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        menu.classList.remove('is-open');
      });
    });

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        menu.classList.remove('is-open');
      }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        menu.classList.remove('is-open');
        toggle.focus();
      }
    });
  })();

  /* =============================================
     3. SCROLL DOTS Y NAVBAR LINKS — Sección activa
  ============================================= */
  (function initScrollSpy() {
    const sections = document.querySelectorAll('.section[id]');
    const dots     = document.querySelectorAll('.nav-dot');
    const navLinks = document.querySelectorAll('.navbar__link');
    if (!sections.length) return;

    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onToggle: self => {
          if (self.isActive) {
            // Actualizar dots
            if (dots.length > 0) {
              dots.forEach(dot => dot.classList.remove('nav-dot--active'));
              if(dots[i]) dots[i].classList.add('nav-dot--active');
            }
            
            // Actualizar links del navbar
            if(navLinks.length > 0) {
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    const id = section.id;
                    const isActive = href === `#${id}` || (id === 'redes-duckes' && href === '#redes-ducks');
                    link.classList.toggle('navbar__link--active', isActive);
                });
            }
          }
        }
      });
    });
  })();

  /* =============================================
     4. ANIMACIONES CON GSAP Y SCROLLTRIGGER
  ============================================= */
  (function initGSAPAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // --- Hero & Page Load Animation ---
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // 1. Aparece el Navbar
    heroTl.fromTo(".site-header",
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.1 }
    )
    // 2. Aparecen los links del menu
    .fromTo(".navbar__item, .navbar__brand",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
      "-=0.4"
    )
    // 3. Aparece el contenido del Hero
    .fromTo(".hero__text > *", 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
      "-=0.2"
    )
    // 4. Entra la imagen (Pato) - Minimalista y elegante
    .fromTo(".hero__illustration-img",
      { y: 30, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
      "-=0.6"
    );

    // Animación de flotación continua ELIMINADA por solicitud minimalista

    // --- Animación de las secciones ("Siguiente landpage") ---
    // Agrega un efecto de entrada en la página cuando pasas a la siguiente sección
    const sections = document.querySelectorAll('.section:not(.section--hero)');
    sections.forEach(section => {
      gsap.fromTo(section,
        { opacity: 0, y: 100 },
        {
          scrollTrigger: {
            trigger: section,
            start: "top 85%", // Inicia cuando la sección entra al 85% de la pantalla
            end: "top 40%",   // Termina cuando llega al 40%
            scrub: 1          // Se enlaza de manera suave al scroll (parallax effect)
          },
          opacity: 1,
          y: 0,
          ease: "none"
        }
      );
    });

    // --- Scroll Animations (Fade Up Elements) ---
    const fadeUpElements = document.querySelectorAll('[data-animate="fade-up"]');
    
    fadeUpElements.forEach(el => {
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) / 1000 : 0;
      
      gsap.fromTo(el, 
        { y: 80, opacity: 0, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: el,
            start: "top 95%", // Inicia cuando casi entra en la pantalla
            toggleActions: "play none none reverse" // Repite la animación al subir y bajar
          },
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.2)",
          delay: delay
        }
      );
    });
  })();

  /* =============================================
     5. STAFF CARDS HOVER — Animación GSAP
  ============================================= */
  (function initStaffCardHover() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const cards = document.querySelectorAll('.staff-card__inner');

    cards.forEach(card => {
      const photoWrap = card.querySelector('.staff-card__photo-wrap');
      
      card.addEventListener('mouseenter', () => {
        // Rotación e incremento en la foto
        if(photoWrap) {
           gsap.to(photoWrap, {
             scale: 1.15,
             rotation: 5,
             y: -5,
             duration: 0.5,
             ease: "back.out(1.5)"
           });
        }
      });

      card.addEventListener('mouseleave', () => {
        // Restaurar estado inicial
        if(photoWrap) {
           gsap.to(photoWrap, {
             scale: 1,
             rotation: 0,
             y: 0,
             duration: 0.5,
             ease: "power2.out"
           });
        }
      });
    });
  })();

  /* =============================================
     6. SOCIAL CARDS HOVER — Animación GSAP de íconos/imágenes
  ============================================= */
  (function initSocialCardHover() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const cards = document.querySelectorAll('.social-card');

    cards.forEach(card => {
      const icon = card.querySelector('.social-card__icon, .social-card__icon--img');
      if (!icon) return;

      // Al pasar el ratón por el contenedor (la tarjeta completa)
      card.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          scale: 1.25,      // Crece 25%
          rotation: -8,     // Rota a la izquierda
          y: -15,           // Sube un poco
          duration: 0.6,
          ease: "back.out(1.7)" // Efecto elástico fuerte (rebote)
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          scale: 1,
          rotation: 0,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      });
    });
  })();

});
