
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
     Hero code window: line-by-line typing reveal
  --------------------------------------------------------------------- */
  if (codeWindow) {
    var codeLines = codeWindow.querySelectorAll('.code-body .line');
    var codeResult = codeWindow.querySelector('.code-result');

    if (prefersReducedMotion) {
      codeLines.forEach(function (line) { line.classList.add('is-visible'); });
      if (codeResult) codeResult.classList.add('show');
    } else {
      var lineDelay = 180; // ms between each line appearing
      codeLines.forEach(function (line, i) {
        setTimeout(function () {
          line.classList.add('is-visible');
        }, lineDelay * (i + 1));
      });
      if (codeResult) {
        setTimeout(function () {
          codeResult.classList.add('show');
        }, lineDelay * codeLines.length + 350);
      }
    }
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

  /* ---------------------------------------------------------------------
   User profile hero: pointer parallax
   (used on the individual developer profile page, harmless elsewhere)
--------------------------------------------------------------------- */
(() => {
  const hero = document.querySelector('[data-profile-hero]');
  const signal = hero?.querySelector('[data-profile-parallax]');

  if (
    !hero ||
    !signal ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const layers = signal.querySelectorAll('[data-parallax-layer]');

  signal.addEventListener('pointermove', (event) => {
    const rect = signal.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    layers.forEach((layer) => {
      const depth =
        layer.dataset.parallaxLayer === 'core'
          ? 18
          : layer.dataset.parallaxLayer === 'code'
            ? 28
            : 34;

      layer.style.setProperty('--px', `${x * depth}px`);
      layer.style.setProperty('--py', `${y * depth}px`);
    });
  });

  signal.addEventListener('pointerleave', () => {
    layers.forEach((layer) => {
      layer.style.setProperty('--px', '0px');
      layer.style.setProperty('--py', '0px');
    });
  });
})();

/* ---------------------------------------------------------------------
   Single project hero: pointer tilt
   (used on the individual project page, harmless elsewhere)
--------------------------------------------------------------------- */
(() => {
  const scene = document.querySelector("[data-project-cinema]");
  const stage = document.querySelector("[data-project-tilt]");
  const frame = stage
    ? stage.querySelector(".project-cinema__frame")
    : null;

  if (
    !scene ||
    !stage ||
    !frame ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const finePointer = window.matchMedia("(pointer: fine)");
  if (!finePointer.matches) return;

  let raf = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const render = () => {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;

    frame.style.setProperty("--tilt-x", `${currentY * -1}deg`);
    frame.style.setProperty("--tilt-y", `${currentX}deg`);

    if (
      Math.abs(targetX - currentX) > 0.01 ||
      Math.abs(targetY - currentY) > 0.01
    ) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  };

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) - 0.5;
    const y = ((event.clientY - rect.top) / rect.height) - 0.5;

    targetX = x * 5;
    targetY = y * 4;

    if (!raf) {
      raf = requestAnimationFrame(render);
    }
  });

  stage.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;

    if (!raf) {
      raf = requestAnimationFrame(render);
    }
  });
})();

/* ---------------------------------------------------------------------
   Login / register: card tilt + companion cat
   (used on the auth page, harmless elsewhere)
--------------------------------------------------------------------- */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- gentle 3D tilt on the auth card, same lerp technique as the
     project cinema frame above --- */
  const stage = document.querySelector('[data-login-tilt]');
  const frame = document.querySelector('[data-login-tilt-frame]');

  if (stage && frame && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    let raf = null;
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      frame.style.setProperty('--tilt-x', `${currentY * -1}deg`);
      frame.style.setProperty('--tilt-y', `${currentX}deg`);
      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        raf = requestAnimationFrame(render);
      } else {
        raf = null;
      }
    };

    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) - 0.5;
      const y = ((event.clientY - rect.top) / rect.height) - 0.5;
      targetX = x * 4;
      targetY = y * 3;
      if (!raf) raf = requestAnimationFrame(render);
    });

    stage.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(render);
    });
  }

  /* --- companion cat: watches the cursor, hides its eyes for passwords --- */
  const cat = document.querySelector('[data-login-cat]');
  if (!cat) return;

  const passwordInputs = Array.prototype.slice.call(document.querySelectorAll('input[type="password"]'));

  function updateShy() {
    const active = document.activeElement;
    const shy = !!active && active.type === 'password' && passwordInputs.indexOf(active) !== -1;
    cat.classList.toggle('is-shy', shy);
  }
  passwordInputs.forEach((input) => {
    input.addEventListener('focus', updateShy);
    input.addEventListener('blur', updateShy);
  });

  // Progressive enhancement: give every password field a show/hide toggle.
  // If this fails to run for any reason, the plain password input still
  // works fine — nothing here is required for the form to function.
  passwordInputs.forEach((input) => {
    const wrap = document.createElement('div');
    wrap.className = 'auth-password-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'auth-password-toggle';
    toggle.setAttribute('aria-label', 'Show password');
    toggle.setAttribute('aria-pressed', 'false');
    toggle.innerHTML =
      '<svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>' +
      '<svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.6 20.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a20.6 20.6 0 0 1-2.66 3.79M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';
    wrap.appendChild(toggle);

    toggle.addEventListener('click', () => {
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      toggle.classList.toggle('is-visible', !showing);
      toggle.setAttribute('aria-pressed', String(!showing));
      toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      updateShy();
      input.focus();
    });
  });

  /* --- eyes follow the cursor + background parallax, one shared loop
     so we're not running two independent pointermove/rAF cycles --- */
  const scene = document.querySelector('[data-login-cinema]');

  if (!reducedMotion) {
    let raf2 = null;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let ptx = 0, pty = 0, pcx = 0, pcy = 0;

    const renderMotion = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      cat.style.setProperty('--eye-x', cx.toFixed(3));
      cat.style.setProperty('--eye-y', cy.toFixed(3));

      const settled =
        Math.abs(tx - cx) < 0.001 && Math.abs(ty - cy) < 0.001 &&
        Math.abs(ptx - pcx) < 0.001 && Math.abs(pty - pcy) < 0.001;
      raf2 = settled ? null : requestAnimationFrame(renderMotion);
    };

    window.addEventListener('pointermove', (event) => {
      const rect = cat.getBoundingClientRect();
      const ccx = rect.left + rect.width / 2;
      const ccy = rect.top + rect.height / 2;
      const dx = event.clientX - ccx;
      const dy = event.clientY - ccy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const reach = Math.min(dist, 280) / 280;
      tx = (dx / dist) * reach;
      ty = (dy / dist) * reach;

      if (scene) {
        const srect = scene.getBoundingClientRect();
        ptx = ((event.clientX - srect.left) / srect.width - 0.5) * 2;
        pty = ((event.clientY - srect.top) / srect.height - 0.5) * 2;
      }

      if (!raf2) raf2 = requestAnimationFrame(renderMotion);
    }, { passive: true });
  }

  /* --- focus vignette across the whole scene, plus a curious ear-perk
     while the username field specifically has focus --- */
  if (scene) {
    const formInputs = Array.prototype.slice.call(scene.querySelectorAll('.auth-form input'));
    formInputs.forEach((input) => {
      input.addEventListener('focus', () => scene.classList.add('is-focused'));
      input.addEventListener('blur', () => scene.classList.remove('is-focused'));
    });

    const usernameInputs = Array.prototype.slice.call(scene.querySelectorAll('input[name="username"]'));
    usernameInputs.forEach((input) => {
      input.addEventListener('focus', () => cat.classList.add('is-alert'));
      input.addEventListener('blur', () => cat.classList.remove('is-alert'));
    });
  }

  /* --- brief loading state on submit; this is a normal full-page POST,
     but the button reacting immediately still makes it feel responsive --- */
  document.querySelectorAll('.auth-form').forEach((form) => {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('.auth-submit');
      if (btn) btn.classList.add('is-loading');
    });
  });

  updateShy();
})();

/* ---------------------------------------------------------------------
   Login scene: soft ambient particle field
   (used on the auth page, harmless elsewhere; skipped under reduced
   motion since it's pure atmosphere, not information)
--------------------------------------------------------------------- */
(() => {
  const canvas = document.querySelector('[data-login-particles]');
  const scene = document.querySelector('[data-login-cinema]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canvas || !scene || reducedMotion || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  const mouse = { x: null, y: null, radius: 110 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = scene.clientWidth;
    height = scene.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const count = Math.min(46, Math.max(18, Math.floor((width * height) / 26000)));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.5 + 1
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    const linkDist = 120;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      if (mouse.x !== null) {
        const dxm = p.x - mouse.x, dym = p.y - mouse.y;
        const distm = Math.sqrt(dxm * dxm + dym * dym);
        if (distm < mouse.radius && distm > 0.01) {
          const force = (mouse.radius - distm) / mouse.radius;
          p.x += (dxm / distm) * force * 0.9;
          p.y += (dym / distm) * force * 0.9;
        }
      }
    }

    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const p1 = particles[a], p2 = particles[b];
        const dx = p1.x - p2.x, dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          ctx.strokeStyle = 'rgba(59, 130, 246, ' + (0.12 * (1 - dist / linkDist)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    for (let c = 0; c < particles.length; c++) {
      const pc = particles[c];
      ctx.beginPath();
      ctx.arc(pc.x, pc.y, pc.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.35)';
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  scene.addEventListener('pointermove', (event) => {
    const rect = scene.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });
  scene.addEventListener('pointerleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  step();
})();

  /* --- liquid flow transition between Sign In and Register --- */
  (() => {
    const authScene = document.querySelector('[data-login-cinema]');
    const authStage = document.querySelector('[data-login-tilt]');
    const switchLinks = document.querySelectorAll('.auth-switch__option[href]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!authScene || !authStage || !switchLinks.length) return;

    switchLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        if (reduce || link.classList.contains('is-active')) return;

        const href = link.href;
        if (!href || authScene.classList.contains('is-transitioning')) return;

        event.preventDefault();

        const rect = link.getBoundingClientRect();

        authScene.style.setProperty(
          '--flow-x',
          `${rect.left + rect.width / 2}px`
        );

        authScene.style.setProperty(
          '--flow-y',
          `${rect.top + rect.height / 2}px`
        );

        let blob = authScene.querySelector('.auth-flow-transition');

        if (!blob) {
          blob = document.createElement('div');
          blob.className = 'auth-flow-transition';
          blob.setAttribute('aria-hidden', 'true');
          authScene.appendChild(blob);
        }

        // Restart the animation every time the user switches page.
        blob.style.animation = 'none';
        void blob.offsetWidth;
        blob.style.animation = '';

        authScene.classList.add('is-transitioning');

        // Navigate after the flow animation finishes.
        window.setTimeout(() => {
          window.location.assign(href);
        }, 500);
      });
    });
  })();



})();