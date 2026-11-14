/* ==========================================================================
   InvestCar — interações
   ========================================================================== */

const CONFIG = {
  whatsapp: '554731700808',
  mensagem: 'Olá, tudo bom? Gostaria de falar com um especialista'
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
let lenis = null;

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------- Header: estado ao rolar + esconder ao descer ---------- */
const header = $('#siteHeader');
const menuToggle = $('.menu-toggle');
const mobileMenu = $('#mobileMenu');
let lastY = window.scrollY;

function onScrollHeader() {
  if (!header) return;
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 12);
  const menuOpen = menuToggle && menuToggle.getAttribute('aria-expanded') === 'true';
  if (!menuOpen) {
    if (y > 480 && y > lastY + 4) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 480) header.classList.remove('is-hidden');
  }
  lastY = y;
}

/* ---------- Menu móvel ---------- */
function setMenu(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.hidden = !open;
  if (open && header) header.classList.remove('is-hidden');
  if (lenis) {
    if (open) lenis.stop();
    else lenis.start();
  }
}
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !mobileMenu.hidden) { setMenu(false); menuToggle.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
}

/* ---------- Marquee: duplica o conteúdo para o loop contínuo ---------- */
$$('.marquee-track').forEach(track => {
  const group = $('.marquee-group', track);
  const items = [...group.children];
  for (let i = 0; i < 4 && group.scrollWidth < window.innerWidth * 1.2; i++) {
    items.forEach(item => group.appendChild(item.cloneNode(true)));
  }
  track.appendChild(group.cloneNode(true));
});

/* ---------- Revelação no scroll ---------- */
const revealEls = $$('[data-reveal]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('is-visible', 'is-done'));
} else {
  const markDone = el => el.classList.add('is-done');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      revealObserver.unobserve(el);
      el.addEventListener('transitionend', e => { if (e.target === el && e.propertyName === 'opacity') markDone(el); }, { once: false });
      setTimeout(() => markDone(el), 1800);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));
}

/* ---------- Parallax leve (hero e imagem do showcase) ---------- */
const heroMedia = $('.hero-media video') || $('.hero-media img');
const hero = $('.hero');
const parallaxEls = $$('[data-parallax]');

const heroVideo = $('.hero-media video');
if (heroVideo) {
  heroVideo.muted = true;
  if (reduceMotion) {
    heroVideo.pause();
  } else {
    heroVideo.play().catch(() => {});
  }
}

function onScrollParallax() {
  if (reduceMotion) return;
  const y = window.scrollY;
  if (hero && heroMedia && y < hero.offsetHeight) heroMedia.style.setProperty('--py', `${y * 0.22}px`);
  const vh = window.innerHeight;
  parallaxEls.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const offset = (r.top + r.height / 2 - vh / 2) * -0.06;
    el.style.setProperty('--py', `${offset.toFixed(1)}px`);
  });
}

/* ---------- Botão flutuante ---------- */
const fab = $('.fab');
const fabLabel = $('.fab-label', fab || document);
if (fabLabel) {
  const fabText = fabLabel.textContent.trim();
  if (fabText) {
    fabLabel.textContent = '';
    [...fabText].forEach((ch, idx) => {
      const span = document.createElement('span');
      span.className = ch === ' ' ? 'fab-char fab-char--space' : 'fab-char';
      span.style.setProperty('--char-i', idx);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      fabLabel.appendChild(span);
    });
  }
}
const footerEl = $('.site-footer');
let footerVisible = false;
if ('IntersectionObserver' in window && footerEl) {
  new IntersectionObserver(([entry]) => { footerVisible = entry.isIntersecting; onScrollFab(); }, { threshold: 0.05 }).observe(footerEl);
}
function onScrollFab() {
  if (!fab) return;
  const heroH = hero ? hero.offsetHeight : 300;
  fab.classList.toggle('is-visible', window.scrollY > heroH * 0.7 && !footerVisible);
}

/* ---------- Link ativo no menu (seção que cruza o meio da tela) + Letras Rainbow (Navbar e Footer) ---------- */
const navLinks = $$('.main-nav a');
$$('.main-nav a, .footer-col a').forEach(a => {
  const text = a.textContent.trim();
  if (!text) return;
  a.setAttribute('aria-label', text);
  a.textContent = '';
  [...text].forEach((ch, idx) => {
    const span = document.createElement('span');
    span.className = ch === ' ' ? 'nav-char nav-char--space' : 'nav-char';
    span.style.setProperty('--char-i', idx);
    span.setAttribute('aria-hidden', 'true');
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    a.appendChild(span);
  });
});
const navTargets = navLinks.map(a => {
  const href = a.getAttribute('href');
  if (href && href.startsWith('#') && href.length > 1) {
    try { return $(href); } catch (e) { return null; }
  }
  return null;
});

function onScrollNav() {
  const mid = window.innerHeight * 0.45;
  const current = navTargets.find(t => {
    if (!t) return false;
    const r = t.getBoundingClientRect();
    return r.top <= mid && r.bottom > mid;
  });
  navLinks.forEach((a, i) => a.classList.toggle('is-active', !!current && navTargets[i] === current));
}

/* ---------- Loop de scroll único ---------- */
let ticking = false;
function onScroll() {
  onScrollHeader();
  onScrollParallax();
  onScrollFab();
  onScrollNav();
}
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });
onScroll();

/* ---------- Scroll suave com Lenis ---------- */
if (!reduceMotion && typeof Lenis !== 'undefined') {
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function lenisRaf(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
      }
      requestAnimationFrame(lenisRaf);
    }

    lenis.on('scroll', () => {
      onScroll();
    });

    window.lenis = lenis;

    /* Navegação suave em âncoras locais */
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = $(href);
        if (target) {
          e.preventDefault();
          if (mobileMenu && !mobileMenu.hidden) setMenu(false);
          const offset = href === '#topo' ? 0 : -80;
          lenis.scrollTo(target, { offset, duration: 1.2 });
        }
      });
    });
  } catch (err) {
    console.warn('Lenis scroll suave não pôde ser iniciado:', err);
  }
}


/* ---------- Como funciona: abas com progresso automático ---------- */
function initSteps(root) {
  const tabs = $$('[role="tab"]', root);
  const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
  const label = $('[data-stage-label]', root);
  const count = $('[data-stage-count]', root);
  const DURATION = 6500;
  let index = 0;
  let elapsed = 0;
  let last = performance.now();
  let inView = false;
  let paused = false;

  function select(i, focus = false) {
    index = (i + tabs.length) % tabs.length;
    tabs.forEach((tab, k) => {
      const on = k === index;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      tab.style.setProperty('--p', reduceMotion && on ? 1 : 0);
      panels[k].hidden = !on;
      panels[k].classList.toggle('is-active', on);
    });
    label.textContent = $('.step-title', tabs[index]).textContent;
    count.textContent = String(index + 1).padStart(2, '0');
    elapsed = 0;
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', e => {
      const keys = { ArrowDown: index + 1, ArrowRight: index + 1, ArrowUp: index - 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
      if (e.key in keys) { e.preventDefault(); select(keys[e.key], true); }
    });
  });

  select(0);
  if (reduceMotion) return;

  root.addEventListener('mouseenter', () => { paused = true; });
  root.addEventListener('mouseleave', () => { paused = false; });
  root.addEventListener('focusin', () => { paused = true; });
  root.addEventListener('focusout', () => { paused = false; });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.35 }).observe(root);

  (function tick(now) {
    if (inView && !paused && !document.hidden) elapsed += now - last;
    last = now;
    const p = Math.min(elapsed / DURATION, 1);
    tabs[index].style.setProperty('--p', p);
    if (p >= 1) select(index + 1);
    requestAnimationFrame(tick);
  })(performance.now());
}
$$('[data-steps]').forEach(initSteps);

/* ---------- 02 · Operações: ciclo em loop de 3 etapas ---------- */
function initOpCycle(root) {
  const steps = $$('.op-step', root);
  if (!steps.length) return;
  const label = $('[data-op-label]', root);
  const STEP_DURATION = 3200;
  let index = 0;
  let elapsed = 0;
  let last = performance.now();
  let inView = false;
  let paused = false;

  function setStage(i) {
    index = (i + steps.length) % steps.length;
    steps.forEach((step, k) => {
      const isActive = k === index;
      const isPassed = k < index;
      step.classList.toggle('is-active', isActive);
      step.classList.toggle('is-passed', isPassed);
      step.style.setProperty('--step-p', isPassed ? 1 : (reduceMotion && isActive ? 1 : 0));
    });
    if (label) {
      const num = String(index + 1).padStart(2, '0');
      const title = $('h3', steps[index])?.textContent || '';
      label.textContent = `${num} · ${title}`;
    }
    elapsed = 0;
  }

  steps.forEach((step, i) => {
    step.addEventListener('click', () => setStage(i));
  });

  setStage(0);
  if (reduceMotion) {
    root.style.setProperty('--cycle-p', 1);
    return;
  }

  root.addEventListener('mouseenter', () => { paused = true; });
  root.addEventListener('mouseleave', () => { paused = false; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.25 }).observe(root);
  } else {
    inView = true;
  }

  (function tick(now) {
    if (inView && !paused && !document.hidden) elapsed += now - last;
    last = now;
    const p = Math.min(elapsed / STEP_DURATION, 1);
    steps[index].style.setProperty('--step-p', p.toFixed(4));
    const cycleProgress = (index + p) / steps.length;
    root.style.setProperty('--cycle-p', cycleProgress.toFixed(4));

    if (p >= 1) setStage(index + 1);
    requestAnimationFrame(tick);
  })(performance.now());
}
$$('[data-op-cycle]').forEach(initOpCycle);

/* ---------- FAQ: acordeão (um aberto por vez) ---------- */
$$('[data-accordion]').forEach(acc => {
  const items = $$('.faq-item', acc);
  items.forEach(item => {
    const btn = $('button', item);
    btn.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach(other => {
        other.classList.remove('is-open');
        $('button', other).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
});

/* ---------- Contato: plano de interesse + link do WhatsApp ---------- */
const chips = $$('.chip-opt');
let selectedPlan = '';

function whatsappHref(plan = selectedPlan) {
  const msg = plan ? `${CONFIG.mensagem} sobre o ${plan}.` : CONFIG.mensagem;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}
function updateWhatsappLinks() {
  if (!CONFIG.whatsapp) return;
  $$('[data-whatsapp]').forEach(a => {
    a.href = whatsappHref();
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('.plan [data-plan]').forEach(btn => {
    btn.href = whatsappHref(btn.dataset.plan);
    btn.target = '_blank';
    btn.rel = 'noopener';
  });
}
function selectPlan(plan) {
  selectedPlan = selectedPlan === plan ? '' : plan;
  chips.forEach(c => c.setAttribute('aria-checked', String(c.dataset.plan === selectedPlan)));
  updateWhatsappLinks();
}

chips.forEach(chip => chip.addEventListener('click', () => selectPlan(chip.dataset.plan)));
$$('.plan [data-plan]').forEach(btn => btn.addEventListener('click', () => {
  selectedPlan = '';
  selectPlan(btn.dataset.plan);
}));
updateWhatsappLinks();

/* ---------- Ano no rodapé ---------- */
$$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- Botões: garante suporte de span ao efeito Diagonal Slash Invert ---------- */
$$('.btn').forEach(btn => {
  [...btn.childNodes].forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const span = document.createElement('span');
      span.textContent = node.textContent;
      btn.replaceChild(span, node);
    }
  });
});

/* ==========================================================================
   07 · VANTAGENS: typewriter + carrossel
   - Padrão (mobile, tablet, telas baixas ou sem GSAP): scroll horizontal
     nativo com snap (CSS) + arraste com o mouse.
   - Desktop com GSAP: seção fixada (.is-pinned) e tira movida pelo ScrollTrigger.
   ========================================================================== */
function initTypewriterVantagens() {
  const el = $('#typewriterText');
  if (!el) return;

  const words = ['vantagens', 'benefícios', 'diferenciais'];
  el.textContent = words[0];            // estado inicial conhecido
  if (reduceMotion) return;             // sem animação para quem prefere menos movimento

  let wordIndex = 0;
  let charIndex = words[0].length;
  let isDeleting = true;
  let visible = true;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(el);
  }

  function typeStep() {
    if (!visible || document.hidden) { setTimeout(typeStep, 400); return; }

    const word = words[wordIndex];
    let delay;
    if (isDeleting) { charIndex--; delay = 65; }
    else { charIndex++; delay = 120; }
    el.textContent = word.substring(0, charIndex);

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 380;
    } else if (!isDeleting && charIndex === word.length) {
      isDeleting = true;
      delay = 2200;
    }
    setTimeout(typeStep, delay);
  }
  setTimeout(typeStep, 2200);
}

/* Se o HTML for salvo a partir do DOM "vivo", sobram wrappers .pin-spacer e
   estilos inline do GSAP que quebram o layout. Limpa tudo antes de iniciar. */
function cleanStalePinMarkup(section, strip) {
  let spacer = section.parentElement;
  while (spacer && spacer.classList.contains('pin-spacer')) {
    spacer.replaceWith(section);
    spacer = section.parentElement;
  }
  section.removeAttribute('style');
  strip.removeAttribute('style');
  section.classList.remove('is-pinned');
}

/* Arrastar com o mouse no modo de scroll nativo (touch e trackpad já funcionam). */
function enableMouseDrag(wrapper, isLocked) {
  let active = false;
  let startX = 0;
  let startLeft = 0;

  wrapper.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || isLocked()) return;
    active = true;
    startX = e.clientX;
    startLeft = wrapper.scrollLeft;
    wrapper.classList.add('is-dragging');
    wrapper.setPointerCapture(e.pointerId);
  });
  wrapper.addEventListener('pointermove', (e) => {
    if (active) wrapper.scrollLeft = startLeft - (e.clientX - startX);
  });
  const stop = (e) => {
    if (!active) return;
    active = false;
    wrapper.classList.remove('is-dragging');
    if (wrapper.hasPointerCapture(e.pointerId)) wrapper.releasePointerCapture(e.pointerId);
  };
  wrapper.addEventListener('pointerup', stop);
  wrapper.addEventListener('pointercancel', stop);
}

function initVantagensGallery() {
  const section = $('.section-vantagens');
  const wrapper = $('#vantagensGalleryWrapper');
  const strip = $('#vantagensGalleryStrip');
  if (!section || !wrapper || !strip) return;

  cleanStalePinMarkup(section, strip);
  enableMouseDrag(wrapper, () => section.classList.contains('is-pinned'));

  // Sem GSAP (ex.: CDN indisponível) ou com "reduzir movimento": fica no scroll nativo.
  if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const mm = gsap.matchMedia();

  // Desktop: fixa a seção em 100svh e converte o scroll vertical em movimento horizontal.
  mm.add('(min-width: 961px) and (min-height: 680px)', () => {
    section.classList.add('is-pinned');
    wrapper.scrollLeft = 0;
    wrapper.tabIndex = -1;

    const distance = () => Math.max(0, strip.scrollWidth - wrapper.clientWidth);

    gsap.to(strip, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        anticipatePin: 1,
        start: 'top top',
        end: () => '+=' + distance(),
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    return () => {
      section.classList.remove('is-pinned');
      wrapper.tabIndex = 0;
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
  });

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
}

initTypewriterVantagens();
initVantagensGallery();

/* ==========================================================================
   BACKGROUND DOT MATRIX (#matrix-canvas)
   ========================================================================== */
(function initDotMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let dots = [];
  let animId = null;

  // --- CONFIGURAÇÕES DA MATRIZ ---
  const SPACING = 24;          // Distância entre cada ponto (em pixels)
  const DOT_RADIUS = 1.1;      // Raio do ponto (finos e nítidos)
  const MAX_DIST = 140;        // Raio de influência do cursor do mouse

  const mouse = {
    x: -1000,
    y: -1000
  };

  const isMobileMode = () => window.matchMedia('(max-width: 768px)').matches;

  // Gera os pontos em grade pela largura e altura da tela
  function initDots() {
    dots = [];
    for (let x = SPACING / 2; x < width; x += SPACING) {
      for (let y = SPACING / 2; y < height; y += SPACING) {
        dots.push({ x, y });
      }
    }
  }

  // No mobile: renderiza os pontos estáticos em tom suave
  function drawStaticDots() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; // Cinza sutil para fundo branco
    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      ctx.moveTo(dot.x + DOT_RADIUS, dot.y);
      ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Ajusta resolução (DPR para telas Retina no desktop)
  function resize() {
    const mobile = isMobileMode();
    const dpr = mobile ? 1 : (window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    initDots();

    if (mobile) {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      drawStaticDots();
    } else {
      if (!animId) {
        animId = requestAnimationFrame(animate);
      }
    }
  }

  // Rastreamento da posição do mouse
  window.addEventListener('mousemove', (e) => {
    if (isMobileMode()) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Loop de animação física no Desktop
  function animate() {
    if (isMobileMode()) {
      drawStaticDots();
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      let px = dot.x;
      let py = dot.y;

      const dx = dot.x - mouse.x;
      const dy = dot.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      // Cor padrão dos pontos inativos (cinza-claro discreto)
      let color = 'rgba(180, 195, 215, 0.45)';

      // Se o mouse estiver próximo, empurra e acende o ponto em degradê azul
      if (dist < MAX_DIST) {
        const factor = 1 - dist / MAX_DIST;
        const force = factor * 22; // Força do empurrão/warp

        if (dist > 0) {
          px += (dx / dist) * force;
          py += (dy / dist) * force;
        }

        // Transição de cor (Cinza-azulado -> Azul Vibrante rgb(0, 102, 255))
        const r = Math.round(180 - 180 * factor);     // 180 -> 0
        const g = Math.round(195 - 93 * factor);      // 195 -> 102
        const b = Math.round(215 + 40 * factor);      // 215 -> 255
        const alpha = (0.45 + 0.55 * factor).toFixed(2); // 0.45 -> 1.00

        color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      // Desenha o ponto individual
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    animId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 100));

  resize();
})();

/* ==========================================================================
   06 · SEGURANÇA: Radial Spotlight Tracker acompanhando o mouse
   ========================================================================== */
(function initSecuritySpotlight() {
  const cards = $$('[data-spotlight-cards] .sec-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mx', `${x.toFixed(1)}px`);
      card.style.setProperty('--my', `${y.toFixed(1)}px`);
    });
  });
})();
