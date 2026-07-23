/**
 * main.js — Page-level interactions (scroll progress, reveal animations).
 * Shared components (nav, footer) are handled by components.js, loaded first.
 */

/* ─── Scroll progress bar ──────────────────────────────────── */
const progressBar = document.getElementById('progressBar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = pct + '%';
  });
}

/* ─── Reveal / stagger animations via IntersectionObserver ─── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .stagger').forEach(el => io.observe(el));
