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
    const sectionIds = ['hero', 'redes-ducks', 'redes-duckes', 'staff'];
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
    const heroEls = document.querySelectorAll('.site-header, .navbar__brand, .navbar__item, .hero__text > *, .hero__illustration-img');
    heroEls.forEach((el, i) => {
      el.style.animationDelay = `${i * 0.08}s`;
      el.classList.add('anim-hero-in');
    });

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

    document.querySelectorAll('[data-animate="fade-up"], .section:not(.section--hero)').forEach(el => {
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
