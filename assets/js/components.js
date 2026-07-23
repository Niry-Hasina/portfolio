/**
 * components.js — Shared nav, mobile panel & footer injected on every page.
 *
 * ── How root detection works ────────────────────────────────────────────────
 * This file lives at  assets/js/components.js  (2 levels below root).
 * new URL('../../', document.currentScript.src)  always resolves to the site
 * root — whether the site is at  /  or  /repo-name/  (GitHub Pages subpath).
 * All nav/footer hrefs are built from that root, so they work correctly from
 * any page depth (root pages, work/ pages, etc.).
 * ────────────────────────────────────────────────────────────────────────────
 */

(function () {
  /* ─── Compute site root URL from this script's location ── */
  const _src = document.currentScript ? document.currentScript.src : '';
  // assets/js/components.js → ../../ = site root
  const rootURL = _src ? new URL('../../', _src).href : '';

  function url(path) {
    return rootURL + path;
  }

  /* ─── Active link detection ───────────────────────────────
   * Examines the current path to decide which nav link is active.
   * Works at any depth and with any base path (Netlify, GitHub Pages).        */
  const segments = window.location.pathname.split('/').filter(Boolean);
  const currentFile  = segments[segments.length - 1] || 'index.html';
  const parentFolder = segments.length >= 2 ? segments[segments.length - 2] : '';

  function isActive(page) {
    if (page === 'work') {
      // Active when we are inside the /work/ directory
      return parentFolder === 'work';
    }
    if (page === 'about') {
      return currentFile === 'about.html';
    }
    return false;
  }

  function ac(page) {
    return isActive(page) ? ' class="active"' : '';
  }

  /* ─── Nav ──────────────────────────────────────────────── */
  function renderNav() {
    const el = document.getElementById('nav-placeholder');
    if (!el) return;
    el.outerHTML = `
  <nav>
    <a class="logo" href="${url('index.html')}">NIRY HASINA R.</a>
    <div class="navlinks">
      <a href="${url('about.html')}"${ac('about')}>About</a>
      <a href="${url('work/')}"${ac('work')}>Work</a>
      <a href="${url('index.html#contact')}">Contact</a>
    </div>
    <a class="nav-cta" href="${url('index.html#contact')}">Get in touch</a>
    <button class="nav-burger" id="navBurger" aria-label="Menu"><span></span><span></span><span></span></button>
  </nav>`;
  }

  /* ─── Mobile panel ─────────────────────────────────────── */
  function renderMobilePanel() {
    const el = document.getElementById('mobile-panel-placeholder');
    if (!el) return;
    el.outerHTML = `
  <div class="mobile-panel" id="mobilePanel">
    <a href="${url('about.html')}">About</a>
    <a href="${url('work/')}">Work</a>
    <a href="${url('index.html#contact')}" id="mobile-contact-link">Contact</a>
  </div>`;
  }

  /* ─── Footer ───────────────────────────────────────────── */
  function renderFooter() {
    const el = document.getElementById('footer-placeholder');
    if (!el) return;
    el.outerHTML = `
  <footer id="contact">
    <div class="footer-inner">
      <div class="footer-title reveal">Let's build something<br><span class="hl">worth remembering.</span></div>
      <div class="footer-grid">
        <div class="footer-col"><span class="label">Contact</span><a href="mailto:randriamihamina@outlook.com">randriamihamina@outlook.com</a><br>+971 55 327 6901</div>
        <div class="footer-col"><span class="label">Elsewhere</span><a href="#">niry-hasina.com</a><br><a href="#">linkedin.com/in/niry-hasina</a></div>
        <div class="footer-col"><span class="label">Based in</span>Silicon Oasis, Dubai, UAE<br>EN · FR · MG</div>
      </div>
    </div>
  </footer>`;
  }

  /* ─── Init ─────────────────────────────────────────────── */
  renderNav();
  renderMobilePanel();
  renderFooter();

  /* Re-init burger after nav is injected */
  const burger = document.getElementById('navBurger');
  const panel  = document.getElementById('mobilePanel');

  if (burger && panel) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      panel.classList.toggle('open');
    });
  }

  /* Contact link in mobile panel closes the menu */
  const mobileContact = document.getElementById('mobile-contact-link');
  if (mobileContact) {
    mobileContact.addEventListener('click', () => {
      if (burger) burger.classList.remove('open');
      if (panel)  panel.classList.remove('open');
    });
  }

  /* Expose closeMenu globally (safety net) */
  window.closeMenu = function () {
    if (burger) burger.classList.remove('open');
    if (panel)  panel.classList.remove('open');
  };
})();
