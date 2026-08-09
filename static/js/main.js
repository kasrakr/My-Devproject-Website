
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Navigation: mobile toggle
  --------------------------------------------------------------------- */
  var nav = document.getElementById('siteNav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var navLinkEls = navLinks ? navLinks.querySelectorAll('.nav__link') : [];

  function closeMenu() {
    if (navLinks) navLinks.classList.remove('is-open');
    if (navToggle) {
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('no-scroll');
  }
  function openMenu() {
    if (navLinks) navLinks.classList.add('is-open');
    if (navToggle) {
      navToggle.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.classList.add('no-scroll');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (navLinks && navLinks.classList.contains('is-open')) { closeMenu(); } else { openMenu(); }
    });
  }
  navLinkEls.forEach(function (link) { link.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------------------------------------------------------------
     Scroll state: nav background + back-to-top visibility
  --------------------------------------------------------------------- */
  var backToTop = document.getElementById('backToTop');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 480);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------------------
     Smooth scroll for in-page anchor links
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      closeMenu();
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* ---------------------------------------------------------------------
     Scrollspy: highlight active nav link
  --------------------------------------------------------------------- */
  var sections = document.querySelectorAll('main section[id]');
  if (navLinks && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = navLinks.querySelector('.nav__link[href="#' + entry.target.id + '"]');
        if (!link || !entry.isIntersecting) return;
        navLinkEls.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------------------
     Reveal-on-scroll animations
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Contact form validation (front-end demo)
     The form already includes {% csrf_token %}. To actually send messages,
     swap the setTimeout below for something like:

       var formData = new FormData(form);
       fetch(form.action || window.location.pathname, {
         method: 'POST',
         headers: { 'X-CSRFToken': formData.get('csrfmiddlewaretoken') },
         body: formData
       }).then(...);
  --------------------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var submitBtn = document.getElementById('submitBtn');
    var formStatus = document.getElementById('formStatus');

    var validators = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your name (2+ characters).'; },
      email: function (v) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(v.trim()) ? '' : 'Please enter a valid email address.';
      },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Message should be at least 10 characters.'; }
    };

    var fieldEls = function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      var wrap = input.closest('.field');
      var errorEl = wrap.querySelector('.field-error');
      return { input: input, wrap: wrap, errorEl: errorEl };
    };

    var validateField = function (name) {
      var els = fieldEls(name);
      var message = validators[name](els.input.value);
      els.wrap.classList.toggle('has-error', !!message);
      els.errorEl.textContent = message;
      return !message;
    };

    ['name', 'email', 'message'].forEach(function (name) {
      var els = fieldEls(name);
      els.input.addEventListener('blur', function () { validateField(name); });
      els.input.addEventListener('input', function () {
        if (els.wrap.classList.contains('has-error')) validateField(name);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var validName = validateField('name');
      var validEmail = validateField('email');
      var validMessage = validateField('message');

      if (!validName || !validEmail || !validMessage) {
        var firstInvalid = form.querySelector('.has-error input, .has-error textarea');
        if (firstInvalid) firstInvalid.focus();
        formStatus.classList.remove('is-success');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(function () {
        formStatus.classList.add('is-success');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }, 900);
    });
  }

  /* ---------------------------------------------------------------------
     Hero code window: subtle mouse parallax
  --------------------------------------------------------------------- */
  var codeWindow = document.getElementById('codeWindow');
  var heroVisual = document.querySelector('.hero__visual');
  if (codeWindow && heroVisual && !prefersReducedMotion) {
    heroVisual.addEventListener('mousemove', function (e) {
      var rect = heroVisual.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      codeWindow.style.transform = 'rotateY(' + (relX * 8) + 'deg) rotateX(' + (relY * -8) + 'deg)';
    });
    heroVisual.addEventListener('mouseleave', function () {
      codeWindow.style.transform = '';
    });
  }

  /* ---------------------------------------------------------------------
     Hero particle network (canvas)
  --------------------------------------------------------------------- */
  var canvas = document.getElementById('particleCanvas');
  var heroSection = document.querySelector('.hero');

  if (canvas && heroSection && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var width, height, dpr;
    var particles = [];
    var mouse = { x: null, y: null, radius: 130 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = heroSection.clientWidth;
      height = heroSection.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function initParticles() {
      var count = Math.min(85, Math.max(24, Math.floor((width * height) / 17000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 1.2
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      var linkDist = 140;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (mouse.x !== null) {
          var dxm = p.x - mouse.x, dym = p.y - mouse.y;
          var distm = Math.sqrt(dxm * dxm + dym * dym);
          if (distm < mouse.radius && distm > 0.01) {
            var force = (mouse.radius - distm) / mouse.radius;
            p.x += (dxm / distm) * force * 1.1;
            p.y += (dym / distm) * force * 1.1;
          }
        }
      }

      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var p1 = particles[a], p2 = particles[b];
          var dx = p1.x - p2.x, dy = p1.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = 'rgba(59, 130, 246, ' + (0.16 * (1 - dist / linkDist)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      for (var c = 0; c < particles.length; c++) {
        var pc = particles[c];
        ctx.beginPath();
        ctx.arc(pc.x, pc.y, pc.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.5)';
        ctx.fill();
      }

      if (!prefersReducedMotion) requestAnimationFrame(step);
    }

    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', function () {
      mouse.x = null;
      mouse.y = null;
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    step();
  }

  /* ---------------------------------------------------------------------
     File upload dropzone: image preview + drag state
     (used on the create/edit project form, harmless elsewhere)
  --------------------------------------------------------------------- */
  document.querySelectorAll('[data-file-drop]').forEach(function (drop) {
    var input = drop.querySelector('input[type="file"]');
    var preview = drop.querySelector('[data-file-preview]');
    if (!input) return;

    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file || !preview) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.hidden = false;
      };
      reader.readAsDataURL(file);
    });

    ['dragover', 'dragenter'].forEach(function (evt) {
      drop.addEventListener(evt, function (e) {
        e.preventDefault();
        drop.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      drop.addEventListener(evt, function () {
        drop.classList.remove('is-dragover');
      });
    });
  });

  /* ---------------------------------------------------------------------
     Confirm before submitting a delete action
  --------------------------------------------------------------------- */
  document.querySelectorAll('[data-confirm-delete]').forEach(function (deleteForm) {
    deleteForm.addEventListener('submit', function (e) {
      var msg = deleteForm.getAttribute('data-confirm-delete') || "Delete this project? This can't be undone.";
      if (!window.confirm(msg)) e.preventDefault();
    });
  });

})();
