/**
 * iOS Club – Technical Community
 * Main Client-side Script
 * Handlers for responsive navigation, smooth scrolling, counter animations,
 * testimonial carousel, modals, and client-side form validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Sticky Navigation & Back-to-Top ---
  const initNavbar = () => {
    const header = document.getElementById('header');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('back-to-top-btn');

    // Add blurred background when user scrolls down
    const onScroll = () => {
      const scrollPos = window.scrollY;

      if (scrollPos > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      if (scrollPos > 350) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Smooth scroll back to top
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mobile menu toggle
    const toggleMenu = (forceState) => {
      const isOpen = forceState !== undefined ? forceState : !navMenu.classList.contains('is-active');

      navMenu.classList.toggle('is-active', isOpen);
      hamburgerBtn.classList.toggle('is-active', isOpen);
      mobileBackdrop.classList.toggle('is-active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburgerBtn.addEventListener('click', () => toggleMenu());
    mobileBackdrop.addEventListener('click', () => toggleMenu(false));

    // Auto-close menu when clicking any nav item
    navLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Smooth scroll for anchor links with header offset
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const offset = header.offsetHeight + 12;
          const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;

          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  // --- Active Nav Link Spy on Scroll ---
  const initScrollSpy = () => {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  // --- Scroll Reveal Animations ---
  const initScrollReveal = () => {
    const revealItems = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute('data-delay') || '0', 10);

            setTimeout(() => {
              el.classList.add('is-revealed');
            }, delay);

            obs.unobserve(el);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealItems.forEach((el) => observer.observe(el));
  };

  // --- Animated Numbers / Statistics ---
  const initCounters = () => {
    const counters = document.querySelectorAll('.counter');
    const statsContainer = document.querySelector('.stats-grid');
    if (!statsContainer || counters.length === 0) return;

    let hasRun = false;

    const startCounters = () => {
      counters.forEach((counter) => {
        const targetValue = parseInt(counter.getAttribute('data-target'), 10) || 0;
        const duration = 2000;
        const startTime = performance.now();

        const tick = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out curve for natural deceleration
          const easeOut = 1 - Math.pow(1 - progress, 2);
          counter.innerText = Math.floor(easeOut * targetValue);

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            counter.innerText = targetValue;
          }
        };

        requestAnimationFrame(tick);
      });
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun) {
            hasRun = true;
            startCounters();
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(statsContainer);
  };

  // --- Testimonial Carousel ---
  const initTestimonialCarousel = () => {
    const track = document.getElementById('testimonial-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prev-testimonial-btn');
    const nextBtn = document.getElementById('next-testimonial-btn');
    const dotsContainer = document.getElementById('carousel-dots');
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.indicator-dot') : [];

    if (!track || slides.length === 0) return;

    let activeIndex = 0;
    const total = slides.length;
    let autoTimer = null;

    const goToSlide = (index) => {
      activeIndex = (index + total) % total;
      track.style.transform = `translateX(-${activeIndex * 100}%)`;

      dots.forEach((dot, idx) => {
        const isSelected = idx === activeIndex;
        dot.classList.toggle('active', isSelected);
        dot.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });
    };

    const next = () => goToSlide(activeIndex + 1);
    const prev = () => goToSlide(activeIndex - 1);

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        next();
        restartAuto();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prev();
        restartAuto();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const slideIdx = parseInt(dot.getAttribute('data-slide'), 10);
        goToSlide(slideIdx);
        restartAuto();
      });
    });

    const startAuto = () => {
      autoTimer = setInterval(next, 5000);
    };

    const stopAuto = () => {
      if (autoTimer) clearInterval(autoTimer);
    };

    const restartAuto = () => {
      stopAuto();
      startAuto();
    };

    startAuto();

    // Pause while mouse is over slider
    const container = document.querySelector('.carousel-container');
    if (container) {
      container.addEventListener('mouseenter', stopAuto);
      container.addEventListener('mouseleave', startAuto);

      // Touch swipe gestures for mobile
      let startX = 0;
      let endX = 0;

      container.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
        stopAuto();
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].screenX;
        const diff = endX - startX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) next();
          else prev();
        }
        startAuto();
      }, { passive: true });
    }
  };

  // --- Modals (Join Us & Event Details) ---
  const initModals = () => {
    const joinModal = document.getElementById('join-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const joinButtons = document.querySelectorAll('.btn-join-modal');

    const eventModal = document.getElementById('event-modal');
    const eventCloseBtn = document.getElementById('event-modal-close-btn');
    const eventDismissBtn = document.getElementById('event-modal-dismiss-btn');
    const eventDetailButtons = document.querySelectorAll('.btn-event-details');
    const eventBadge = document.getElementById('event-badge-text');
    const eventTitle = document.getElementById('event-modal-title');
    const eventSubtitle = document.getElementById('event-modal-subtitle');
    const eventBody = document.getElementById('event-modal-body');

    const openModal = (modal) => {
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    // Open Join modal from any Join button
    joinButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(eventModal);
        openModal(joinModal);
      });
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => closeModal(joinModal));
    }

    if (joinModal) {
      joinModal.addEventListener('click', (e) => {
        if (e.target === joinModal) closeModal(joinModal);
      });
    }

    // Event details data
    const eventInfo = {
      hackathon: {
        badge: 'Flagship Annual Competition',
        title: 'SwiftHack 2026: 36-Hour Hackathon',
        subtitle: 'Build innovative iOS, AI, and mobile solutions with real-world impact.',
        content: `
          <div style="display:flex; flex-direction:column; gap:16px;">
            <p><strong>SwiftHack '26</strong> is iOS Club's flagship annual hackathon bringing together over 300+ builders, designers, and problem solvers from colleges across the region.</p>
            <div style="background:rgba(255,255,255,0.04); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
              <h4 style="color:#00f2fe; margin-bottom:8px;">Key Highlights:</h4>
              <ul style="padding-left:18px; display:flex; flex-direction:column; gap:6px;">
                <li>Tracks: Swift & iOS Platforms, CoreML Innovation, Cyber Defense & Open Track.</li>
                <li>Mentorship from senior software engineers at top tech companies.</li>
                <li>Free food, midnight pizzas, official swag boxes & sponsor prizes.</li>
                <li>$2,500 Cash prize pool + cloud credits for top teams.</li>
              </ul>
            </div>
            <p><small style="color:#94a3b8;">Team size: 2 to 4 members. Solo registrants can match during our mixer.</small></p>
          </div>
        `
      },
      techtalks: {
        badge: 'Monthly Speaker Series',
        title: 'Tech Talks: Building Distributed Systems at Scale',
        subtitle: 'Fireside chat with industry engineers and system architects.',
        content: `
          <div style="display:flex; flex-direction:column; gap:16px;">
            <p>Learn how modern engineering teams architect fault-tolerant distributed platforms serving high concurrent traffic.</p>
            <div style="background:rgba(255,255,255,0.04); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
              <h4 style="color:#c084fc; margin-bottom:8px;">Session Agenda:</h4>
              <ul style="padding-left:18px; display:flex; flex-direction:column; gap:6px;">
                <li>Modern Microservices vs Modular Monolith architectures.</li>
                <li>Handling live data streams and caching strategies.</li>
                <li>Real-world postmortems: What happens when production fails?</li>
                <li>Live open Q&A and student career mentorship.</li>
              </ul>
            </div>
          </div>
        `
      },
      workshops: {
        badge: 'Hands-on Code Laboratory',
        title: 'Full-Stack Web & iOS Sprint: Zero to Cloud Deploy',
        subtitle: 'A practical, 3-hour weekend code-along to build & deploy a live app.',
        content: `
          <div style="display:flex; flex-direction:column; gap:16px;">
            <p>Bring your laptop and code along step-by-step as we construct an authenticated real-time application.</p>
            <div style="background:rgba(255,255,255,0.04); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
              <h4 style="color:#34d399; margin-bottom:8px;">Topics Covered:</h4>
              <ul style="padding-left:18px; display:flex; flex-direction:column; gap:6px;">
                <li>Setting up modern frontend build tools and UI frameworks.</li>
                <li>Designing clean REST APIs and database models.</li>
                <li>Handling user authentication securely.</li>
                <li>Deploying live to cloud hosting platforms.</li>
              </ul>
            </div>
          </div>
        `
      },
      all: {
        badge: 'iOS Club Calendar 2026',
        title: 'Upcoming Events & Timeline',
        subtitle: 'Mark your calendars for our technical workshops, competitions, and meetups.',
        content: `
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.04); border-left:3px solid #00f2fe;">
              <strong>March 28–29:</strong> SwiftHack '26 Campus Hackathon (Hybrid)
            </div>
            <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.04); border-left:3px solid #a855f7;">
              <strong>April 12:</strong> Distributed Architecture Tech Talk (Virtual)
            </div>
            <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.04); border-left:3px solid #10b981;">
              <strong>April 18:</strong> Full-Stack Cloud Lab (Lab 304)
            </div>
            <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.04); border-left:3px solid #f59e0b;">
              <strong>May 02:</strong> Capture The Flag (CTF) Cyber Defense Championship
            </div>
          </div>
        `
      }
    };

    eventDetailButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const eventKey = btn.getAttribute('data-event') || 'hackathon';
        const data = eventInfo[eventKey] || eventInfo.hackathon;

        if (eventBadge) eventBadge.textContent = data.badge;
        if (eventTitle) eventTitle.textContent = data.title;
        if (eventSubtitle) eventSubtitle.textContent = data.subtitle;
        if (eventBody) eventBody.innerHTML = data.content;

        openModal(eventModal);
      });
    });

    if (eventCloseBtn) eventCloseBtn.addEventListener('click', () => closeModal(eventModal));
    if (eventDismissBtn) eventDismissBtn.addEventListener('click', () => closeModal(eventModal));

    if (eventModal) {
      eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) closeModal(eventModal);
      });
    }

    // Close any modal with the ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (joinModal && joinModal.classList.contains('is-open')) closeModal(joinModal);
        if (eventModal && eventModal.classList.contains('is-open')) closeModal(eventModal);
      }
    });
  };

  // --- Toast Notifications ---
  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    const icon = type === 'error' ? '⚠️' : '🎉';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  };

  // --- Form Handling & Validation ---
  const initForms = () => {
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const toggleFieldState = (field, isValid) => {
      const group = field.closest('.form-group');
      if (group) {
        group.classList.toggle('has-error', !isValid);
      }
    };

    // Direct Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name');
        const email = document.getElementById('contact-email');
        const msg = document.getElementById('contact-message');
        const btn = document.getElementById('contact-submit-btn');

        let valid = true;

        if (!name.value.trim()) { toggleFieldState(name, false); valid = false; }
        else { toggleFieldState(name, true); }

        if (!isValidEmail(email.value.trim())) { toggleFieldState(email, false); valid = false; }
        else { toggleFieldState(email, true); }

        if (msg.value.trim().length < 10) { toggleFieldState(msg, false); valid = false; }
        else { toggleFieldState(msg, true); }

        if (valid) {
          btn.disabled = true;
          btn.innerHTML = `<span>Sending...</span>`;

          setTimeout(() => {
            showToast(`Thanks ${name.value.trim()}! We received your message and will respond shortly.`);
            contactForm.reset();
            btn.disabled = false;
            btn.innerHTML = `
              <span>Send Message</span>
              <svg viewBox="0 0 16 16" fill="none" class="btn-arrow"><path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            `;
          }, 800);
        }
      });

      contactForm.querySelectorAll('.form-input, .form-textarea').forEach((input) => {
        input.addEventListener('input', () => toggleFieldState(input, true));
      });
    }

    // Join Us Application Form
    const joinForm = document.getElementById('join-form');
    const joinModal = document.getElementById('join-modal');

    if (joinForm) {
      joinForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('join-name');
        const email = document.getElementById('join-email');
        const year = document.getElementById('join-year');
        const domain = document.getElementById('join-domain');
        const btn = document.getElementById('join-submit-btn');

        let valid = true;

        if (!name.value.trim()) { toggleFieldState(name, false); valid = false; }
        else { toggleFieldState(name, true); }

        if (!isValidEmail(email.value.trim())) { toggleFieldState(email, false); valid = false; }
        else { toggleFieldState(email, true); }

        if (!year.value) { toggleFieldState(year, false); valid = false; }
        else { toggleFieldState(year, true); }

        if (!domain.value) { toggleFieldState(domain, false); valid = false; }
        else { toggleFieldState(domain, true); }

        if (valid) {
          btn.disabled = true;
          btn.innerHTML = `<span>Registering...</span>`;

          setTimeout(() => {
            if (joinModal) {
              joinModal.classList.remove('is-open');
              document.body.style.overflow = '';
            }
            showToast(`Welcome aboard, ${name.value.trim()}! Please check your email for the community Discord invite.`);
            joinForm.reset();
            btn.disabled = false;
            btn.innerHTML = `
              <span>Complete Membership Application</span>
              <svg viewBox="0 0 16 16" fill="none" class="btn-arrow"><path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            `;
          }, 900);
        }
      });

      joinForm.querySelectorAll('.form-input, .form-select').forEach((el) => {
        el.addEventListener('input', () => toggleFieldState(el, true));
        el.addEventListener('change', () => toggleFieldState(el, true));
      });
    }

    // Newsletter in footer
    const newsletterBtn = document.getElementById('newsletter-btn');
    const newsletterInput = document.getElementById('newsletter-input');

    if (newsletterBtn && newsletterInput) {
      const handleNewsletter = () => {
        const val = newsletterInput.value.trim();
        if (isValidEmail(val)) {
          showToast('Subscribed! You will receive our weekly tech digest every Friday.');
          newsletterInput.value = '';
        } else {
          showToast('Please enter a valid college email.', 'error');
        }
      };

      newsletterBtn.addEventListener('click', handleNewsletter);
      newsletterInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleNewsletter();
      });
    }
  };

  // --- Interactive Futuristic Custom Cursor System ---
  const initCustomCursor = () => {
    // Only activate on devices with fine pointer (mouse/trackpad), not touch screens
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const container = document.getElementById('custom-cursor-container');
    const glowEl = document.getElementById('cursor-glow');
    const outerEl = document.getElementById('cursor-outer');
    const innerEl = document.getElementById('cursor-inner');
    const canvas = document.getElementById('cursor-canvas');

    if (!container || !glowEl || !outerEl || !innerEl || !canvas) return;

    // Enable custom cursor styling
    document.body.classList.add('custom-cursor-enabled');

    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Coordinates and physics state
    let mouseX = -200;
    let mouseY = -200;
    let prevMouseX = -200;
    let prevMouseY = -200;
    let mouseSpeed = 0;

    let innerX = -200;
    let innerY = -200;
    let outerX = -200;
    let outerY = -200;
    let glowX = -200;
    let glowY = -200;

    let isVisible = false;
    let isMouseDown = false;
    let magneticTarget = null;
    let magneticRect = null;

    // Particles system
    const particles = [];
    const maxParticles = 40;
    const sparkColors = [
      '#00f2fe',
      '#4facfe',
      '#a855f7',
      '#ec4899',
      '#38bdf8'
    ];

    class SparkParticle {
      constructor(x, y, vx, vy, color, size, decay) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxSize = size;
        this.decay = decay || 0.035;
        this.alpha = 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.vy -= 0.02; // soft upward drift
        this.alpha -= this.decay;
        this.size = Math.max(0.2, this.maxSize * (this.alpha));
      }

      draw(context) {
        if (this.alpha <= 0) return;
        context.save();
        context.globalAlpha = Math.max(0, this.alpha);
        context.fillStyle = this.color;
        context.shadowBlur = 6;
        context.shadowColor = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    // Spawn click shockwave ripple element
    const spawnClickRipple = (x, y) => {
      if (prefersReducedMotion) return;
      const ripple = document.createElement('div');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);

      ripple.addEventListener('animationend', () => {
        ripple.remove();
      }, { once: true });
    };

    // Spawn click spark burst
    const spawnClickBurst = (x, y) => {
      if (prefersReducedMotion) return;
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.6;
        const speed = 2.2 + Math.random() * 3.8;
        const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
        const size = 2 + Math.random() * 2;
        particles.push(new SparkParticle(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          size,
          0.04 + Math.random() * 0.03
        ));
      }
    };

    // Track mouse movement
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        container.classList.add('is-active');
        innerX = mouseX;
        innerY = mouseY;
        outerX = mouseX;
        outerY = mouseY;
        glowX = mouseX;
        glowY = mouseY;
      }

      // Calculate speed
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      mouseSpeed = Math.hypot(dx, dy);

      // Add gentle stardust particle trail when moving swiftly
      if (!prefersReducedMotion && mouseSpeed > 3 && particles.length < maxParticles) {
        if (Math.random() < 0.65) {
          const offsetX = (Math.random() - 0.5) * 8;
          const offsetY = (Math.random() - 0.5) * 8;
          const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
          particles.push(new SparkParticle(
            mouseX + offsetX,
            mouseY + offsetY,
            (Math.random() - 0.5) * 1.2,
            (Math.random() - 0.5) * 1.2,
            color,
            1.6 + Math.random() * 1.6,
            0.038
          ));
        }
      }

      prevMouseX = mouseX;
      prevMouseY = mouseY;

      // Update interactive card spotlight position
      const hoveredCard = e.target.closest(
        '.glass-panel, .project-card, .event-card, .domain-card, .benefit-card, .team-card, .testimonial-card, .faq-card, .cta-box, .stat-card'
      );
      if (hoveredCard) {
        const rect = hoveredCard.getBoundingClientRect();
        hoveredCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        hoveredCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }
    };

    // State detection for elements under cursor
    const updateCursorState = (target) => {
      if (!target) return;

      // Reset state classes
      container.classList.remove('is-hovering', 'is-card-hover', 'is-text-hover', 'is-input-hover');
      magneticTarget = null;
      magneticRect = null;

      // 1. Inputs & forms
      if (target.closest('input, textarea, select')) {
        container.classList.add('is-input-hover');
        return;
      }

      // 2. Action buttons, links, clickable tags & controls
      const interactiveEl = target.closest(
        'a, button, .btn, .nav-link, .tag, .chip, [role="button"], .hamburger-btn, .back-to-top-btn, .modal-close-btn, .faq-question, .filter-chip'
      );
      if (interactiveEl) {
        container.classList.add('is-hovering');

        // Check if small circular button for magnetic pull effect
        if (interactiveEl.classList.contains('hamburger-btn') ||
            interactiveEl.classList.contains('back-to-top-btn') ||
            interactiveEl.classList.contains('modal-close-btn') ||
            interactiveEl.classList.contains('theme-toggle-btn')) {
          magneticTarget = interactiveEl;
          magneticRect = interactiveEl.getBoundingClientRect();
        }
        return;
      }

      // 3. Cards & interactive containers
      const cardEl = target.closest(
        '.project-card, .event-card, .domain-card, .benefit-card, .team-card, .testimonial-card, .faq-card, .timeline-card, .terminal-card'
      );
      if (cardEl) {
        container.classList.add('is-card-hover');
        return;
      }

      // 4. Large Headings & Highlight text
      if (target.closest('h1, h2, .gradient-text, .hero-subheading, .stat-value')) {
        container.classList.add('is-text-hover');
        return;
      }
    };

    // Mouse event listeners
    window.addEventListener('mousemove', (e) => {
      onMouseMove(e);
      updateCursorState(e.target);
    }, { passive: true });

    window.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      container.classList.add('is-clicked');
      spawnClickRipple(e.clientX, e.clientY);
      spawnClickBurst(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
      container.classList.remove('is-clicked');
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      container.classList.remove('is-active');
    });

    document.addEventListener('mouseenter', () => {
      isVisible = true;
      container.classList.add('is-active');
    });

    // Render loop using requestAnimationFrame
    let animationFrameId = null;
    let isPaused = false;

    const render = () => {
      if (isPaused) return;

      // Magnetic pull interpolation if hovering magnetic element
      let targetOuterX = mouseX;
      let targetOuterY = mouseY;

      if (magneticTarget && magneticRect) {
        const centerX = magneticRect.left + magneticRect.width / 2;
        const centerY = magneticRect.top + magneticRect.height / 2;
        targetOuterX = targetOuterX + (centerX - targetOuterX) * 0.45;
        targetOuterY = targetOuterY + (centerY - targetOuterY) * 0.45;
      }

      // Smooth physics lerp with increased speed and responsiveness
      innerX = mouseX;
      innerY = mouseY;

      outerX += (targetOuterX - outerX) * 0.38;
      outerY += (targetOuterY - outerY) * 0.38;

      glowX += (mouseX - glowX) * 0.18;
      glowY += (mouseY - glowY) * 0.18;

      // Apply transforms
      innerEl.style.transform = `translate3d(${innerX.toFixed(2)}px, ${innerY.toFixed(2)}px, 0)`;
      outerEl.style.transform = `translate3d(${outerX.toFixed(2)}px, ${outerY.toFixed(2)}px, 0)`;
      glowEl.style.transform = `translate3d(${glowX.toFixed(2)}px, ${glowY.toFixed(2)}px, 0)`;

      // Render canvas particles
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (particles.length > 0) {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.update();
          p.draw(ctx);
          if (p.alpha <= 0) {
            particles.splice(i, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Start render loop
    animationFrameId = requestAnimationFrame(render);

    // Pause rendering when tab is hidden to save GPU/CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPaused = true;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else {
        isPaused = false;
        animationFrameId = requestAnimationFrame(render);
      }
    });
  };

  // --- 3D Moving Space Particles System (Backside Background) ---
  const init3DBackgroundParticles = () => {
    const canvas = document.getElementById('bg-particles-3d');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Particle field properties
    const particleCount = prefersReducedMotion ? 35 : 95;
    const particles = [];
    const fieldRange = 850;
    const depthRange = 550;
    const focalLength = 650;

    const colors = [
      { r: 0, g: 242, b: 254 },    // Neon cyan
      { r: 79, g: 172, b: 254 },   // Electric blue
      { r: 99, g: 102, b: 241 },   // Indigo
      { r: 168, g: 85, b: 247 },   // Vivid purple
      { r: 236, g: 72, b: 153 }    // Accent pink
    ];

    class Particle3D {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = (Math.random() - 0.5) * fieldRange * 2;
        this.y = (Math.random() - 0.5) * fieldRange * 1.8;
        this.z = initial ? (Math.random() - 0.5) * depthRange * 2 : depthRange;

        // Subtle 3D drifting velocity
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.vz = -0.25 - Math.random() * 0.35; // gentle forward drift towards camera

        this.baseRadius = 1.6 + Math.random() * 2.2;
        this.colorObj = colors[Math.floor(Math.random() * colors.length)];
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
        this.pulseAngle = Math.random() * Math.PI * 2;
        this.hasOrbitRing = Math.random() < 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        this.pulseAngle += this.pulseSpeed;

        // Wrap around boundaries
        if (this.z < -depthRange) this.z = depthRange;
        if (this.x < -fieldRange) this.x = fieldRange;
        if (this.x > fieldRange) this.x = -fieldRange;
        if (this.y < -fieldRange) this.y = fieldRange;
        if (this.y > fieldRange) this.y = -fieldRange;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle3D());
    }

    // Interactive mouse rotation state
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    let ambientAngleX = 0;
    let ambientAngleY = 0;

    window.addEventListener('mousemove', (e) => {
      targetTiltY = ((e.clientX / width) - 0.5) * 0.65;
      targetTiltX = ((e.clientY / height) - 0.5) * -0.55;
    }, { passive: true });

    // Scroll parallax integration
    let scrollY = window.scrollY;
    let targetScrollOffset = 0;
    let currentScrollOffset = 0;

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      targetScrollOffset = scrollY * 0.15;
    }, { passive: true });

    let animId = null;
    let isPaused = false;

    const render = () => {
      if (isPaused) return;

      ctx.clearRect(0, 0, width, height);

      // Interpolate tilt and scroll parallax
      currentTiltX += (targetTiltX - currentTiltX) * 0.045;
      currentTiltY += (targetTiltY - currentTiltY) * 0.045;
      currentScrollOffset += (targetScrollOffset - currentScrollOffset) * 0.08;

      if (!prefersReducedMotion) {
        ambientAngleY += 0.0012;
        ambientAngleX += 0.0006;
      }

      const totalRotY = currentTiltY + ambientAngleY;
      const totalRotX = currentTiltX + ambientAngleX;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      const centerX = width / 2;
      const centerY = height / 2;

      // Projected particles array for connection lines
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();

        // 3D coordinate rotation
        // 1. Rotate around Y axis
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = p.z * cosY - p.x * sinY;

        // 2. Rotate around X axis (including subtle scroll vertical tilt)
        const pyWithScroll = p.y - (currentScrollOffset % fieldRange);
        const y2 = pyWithScroll * cosX - z1 * sinX;
        const z2 = z1 * cosX + pyWithScroll * sinX;

        // 3D Perspective Projection
        const depth = z2 + 750;
        if (depth <= 60) continue;

        const scale = focalLength / depth;
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y2 * scale;

        // Skip if outside viewport margins
        if (screenX < -80 || screenX > width + 80 || screenY < -80 || screenY > height + 80) {
          continue;
        }

        const depthAlpha = Math.min(1, Math.max(0.12, (scale * 0.95)));
        const pulse = 0.85 + Math.sin(p.pulseAngle) * 0.15;
        const currentRadius = p.baseRadius * scale * pulse;

        projected.push({
          x: screenX,
          y: screenY,
          radius: currentRadius,
          colorObj: p.colorObj,
          alpha: depthAlpha,
          scale: scale,
          hasOrbitRing: p.hasOrbitRing
        });
      }

      // Draw 3D glowing constellation connections between nearby nodes
      ctx.lineWidth = 1;
      const connectionDist = 110;

      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDist * connectionDist) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / connectionDist) * 0.18 * Math.min(p1.alpha, p2.alpha);

            ctx.strokeStyle = `rgba(${p1.colorObj.r}, ${p1.colorObj.g}, ${p1.colorObj.b}, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw 3D glowing particle nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const { r, g, b } = p.colorObj;

        ctx.save();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;

        // Glow bloom for near particles
        if (p.scale > 0.75) {
          ctx.shadowBlur = 10 * p.scale;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.8})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.radius), 0, Math.PI * 2);
        ctx.fill();

        // Accent outer glow ring for selected stars
        if (p.hasOrbitRing && p.scale > 0.7) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.45})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isPaused = true;
        if (animId) cancelAnimationFrame(animId);
      } else {
        isPaused = false;
        animId = requestAnimationFrame(render);
      }
    });
  };

  // --- Bootstrap All Modules ---
  initNavbar();
  initScrollSpy();
  initScrollReveal();
  initCounters();
  initTestimonialCarousel();
  initModals();
  initForms();
  initCustomCursor();
  init3DBackgroundParticles();
});
