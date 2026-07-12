

'use strict';

document.addEventListener("DOMContentLoaded", (event) => {
  
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP o ScrollTrigger no se cargaron correctamente.");
    return;
  }

  
  gsap.registerPlugin(ScrollTrigger);

  
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

    
    menu.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        menu.classList.remove('is-open');
      });
    });

    
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        menu.classList.remove('is-open');
      }
    });

    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        menu.classList.remove('is-open');
        toggle.focus();
      }
    });
  })();

  
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
            
            if (dots.length > 0) {
              dots.forEach(dot => dot.classList.remove('nav-dot--active'));
              if(dots[i]) dots[i].classList.add('nav-dot--active');
            }
            
            
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

  
  (function initGSAPAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    
    heroTl.fromTo(".site-header",
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.1 }
    )
    
    .fromTo(".navbar__item, .navbar__brand",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
      "-=0.4"
    )
    
    .fromTo(".hero__text > *", 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
      "-=0.2"
    )
    
    .fromTo(".hero__illustration-img",
      { y: 30, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
      "-=0.6"
    );

    

    
    
    const sections = document.querySelectorAll('.section:not(.section--hero)');
    sections.forEach(section => {
      gsap.fromTo(section,
        { opacity: 0, y: 100 },
        {
          scrollTrigger: {
            trigger: section,
            start: "top 85%", 
            end: "top 40%",   
            scrub: 1          
          },
          opacity: 1,
          y: 0,
          ease: "none"
        }
      );
    });

    
    const fadeUpElements = document.querySelectorAll('[data-animate="fade-up"]');
    
    fadeUpElements.forEach(el => {
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) / 1000 : 0;
      
      gsap.fromTo(el, 
        { y: 80, opacity: 0, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: el,
            start: "top 95%", 
            toggleActions: "play none none reverse" 
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

  
  (function initStaffCardHover() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const cards = document.querySelectorAll('.staff-card__inner');

    cards.forEach(card => {
      const photoWrap = card.querySelector('.staff-card__photo-wrap');
      
      card.addEventListener('mouseenter', () => {
        
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

  
  (function initSocialCardHover() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const cards = document.querySelectorAll('.social-card');

    cards.forEach(card => {
      const icon = card.querySelector('.social-card__icon, .social-card__icon--img');
      if (!icon) return;

      
      card.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          scale: 1.25,      
          rotation: -8,     
          y: -15,           
          duration: 0.6,
          ease: "back.out(1.7)" 
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
