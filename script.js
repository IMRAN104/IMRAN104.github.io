'use strict';

/* ── CUSTOM CURSOR ── */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let ringX = 0, ringY = 0, dotX = 0, dotY = 0;

if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    dotX = e.clientX; dotY = e.clientY;
    cursorDot.style.left  = dotX + 'px';
    cursorDot.style.top   = dotY + 'px';
  }, { passive: true });

  // Ring lags behind slightly for a fluid feel
  function animateRing() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Expand ring on interactive elements
  const hoverEls = document.querySelectorAll('a, button, [role="button"], .magnetic, .pcard, .tech-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
  });
}

/* ── TYPING ANIMATION ── */
const roles = ['Software Engineer', 'Full-Stack Developer', 'Mobile Developer', '.NET Architect', 'Open-Source Builder'];
let rIdx = 0, cIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-text');

function typeLoop() {
  const word = roles[rIdx];
  typedEl.textContent = deleting ? word.slice(0, cIdx - 1) : word.slice(0, cIdx + 1);
  deleting ? cIdx-- : cIdx++;

  if (!deleting && cIdx === word.length) { setTimeout(() => { deleting = true; }, 2400); return; }
  if (deleting && cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; }
  setTimeout(typeLoop, deleting ? 42 : 88);
}
typeLoop();

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ── MOBILE NAVIGATION ── */
const hamburger        = document.getElementById('hamburger');
const mobileNav        = document.getElementById('mobile-nav');
const mobileNavClose   = document.getElementById('mobile-nav-close');
const mobileNavBackdrop= document.getElementById('mobile-nav-backdrop');

function getFocusable(el) {
  return [...el.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')];
}

function openNav() {
  mobileNav.classList.add('open');
  mobileNavBackdrop.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Close navigation menu');
  // Focus first link
  const first = getFocusable(mobileNav)[0];
  if (first) setTimeout(() => first.focus(), 50);
}

function closeNav() {
  mobileNav.classList.remove('open');
  mobileNavBackdrop.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation menu');
  hamburger.focus();
}

hamburger.addEventListener('click', () =>
  mobileNav.classList.contains('open') ? closeNav() : openNav()
);
mobileNavClose.addEventListener('click', closeNav);
mobileNavBackdrop.addEventListener('click', closeNav);
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeNav));

// Focus trap + Escape inside mobile menu
mobileNav.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeNav(); return; }
  if (e.key !== 'Tab') return;
  const focusable = getFocusable(mobileNav);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ── COUNTER ANIMATION ── */
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  if (!Number.isFinite(target) || target <= 0) return;
  const duration = 1800;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

/* ── INTERSECTION OBSERVER — scroll reveals + counters ── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Stats counters
const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach(countUp);
    statsObs.unobserve(entry.target);
  });
}, { threshold: 0.4 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObs.observe(heroStats);

/* ── STAGGER CHILDREN (project cards, stack cols) ── */
document.querySelectorAll('.projects-grid, .stack-grid').forEach(grid => {
  const items = grid.querySelectorAll('.reveal');
  items.forEach((item, i) => {
    item.style.transitionDelay = (i * 80) + 'ms';
  });
});

/* ── SMOOTH ACTIVE NAV LINK ── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navAnchors.forEach(a => {
      const active = a.getAttribute('href') === '#' + id;
      a.style.color = active ? 'var(--text-1)' : '';
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObs.observe(s));
