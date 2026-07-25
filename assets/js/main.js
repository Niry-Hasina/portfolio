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

/* ─── Gallery lightbox ──────────────────────────────────────── */
(function () {
  const galleryTiles = document.querySelectorAll('.g-tile');
  const lightbox     = document.getElementById('lightbox');
  if (!galleryTiles.length || !lightbox) return;   // not a case-study page

  const lbTrack   = lightbox.querySelector('.lightbox-track');
  const lbCounter = lightbox.querySelector('.lightbox-counter');
  let   lbIndex   = 0;
  const lbTotal   = galleryTiles.length;

  /* ─── Build one slide per tile ─── */
  galleryTiles.forEach((tile) => {
    const slide = document.createElement('div');
    slide.className = 'lightbox-slide';
    const img = tile.querySelector('img');
    if (img) {
      slide.appendChild(img.cloneNode(true));
    } else {
      const ph = tile.querySelector('.cs-placeholder');
      if (ph) slide.innerHTML = ph.outerHTML;
    }
    lbTrack.appendChild(slide);
  });

  /* ─── Zoom + Pan state ─── */
  const ZOOM   = 2.5;
  const THRESH = 4;         // px before a mousedown counts as a drag
  let panX = 0, panY = 0;
  let isPanning = false, hasDragged = false;
  let dragStartX = 0, dragStartY = 0;
  let touchId = null;

  function getActiveImg() {
    const slide = lbTrack.querySelectorAll('.lightbox-slide')[lbIndex];
    return slide ? slide.querySelector('img') : null;
  }

  /* Apply current pan on top of the zoom (translate is in element-local px) */
  function applyPan(img) {
    img.style.transition = 'none';
    img.style.transform  = `scale(${ZOOM}) translate(${panX / ZOOM}px, ${panY / ZOOM}px)`;
  }

  function resetZoom() {
    const img = getActiveImg();
    if (!img) return;
    img.classList.remove('lb-zoomed');
    img.style.transition      = '';
    img.style.transform       = '';
    img.style.transformOrigin = '';
    img.style.cursor          = '';
    panX = 0; panY = 0;
  }

  function updateLightbox() {
    resetZoom();
    lbTrack.style.transform = `translateX(-${lbIndex * 100}%)`;
    if (lbCounter) lbCounter.textContent = (lbIndex + 1) + ' / ' + lbTotal;
  }

  function openLightbox(index) {
    lbIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    resetZoom();
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function lbGoTo(i) { lbIndex = (i + lbTotal) % lbTotal; updateLightbox(); }

  /* ─── Click: zoom in at cursor / dezoom on tap (only if not a drag) ─── */
  lbTrack.addEventListener('click', (e) => {
    if (hasDragged) { hasDragged = false; return; }   // was a pan — ignore
    const img = e.target.closest('.lightbox-slide img');
    if (!img) return;

    if (img.classList.contains('lb-zoomed')) {
      resetZoom();
    } else {
      const rect = img.getBoundingClientRect();
      const ox   = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const oy   = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      img.style.transition      = '';
      img.style.transformOrigin = `${ox} ${oy}`;
      img.style.transform       = `scale(${ZOOM})`;
      img.style.cursor          = 'grab';
      img.classList.add('lb-zoomed');
      panX = 0; panY = 0;
    }
  });

  /* ─── Mouse pan ─── */
  lbTrack.addEventListener('mousedown', (e) => {
    const img = e.target.closest('.lightbox-slide img');
    if (!img || !img.classList.contains('lb-zoomed')) return;
    isPanning   = true;
    hasDragged  = false;
    dragStartX  = e.clientX - panX;
    dragStartY  = e.clientY - panY;
    img.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    const img = getActiveImg();
    if (!img || !img.classList.contains('lb-zoomed')) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx - panX) > THRESH || Math.abs(dy - panY) > THRESH) hasDragged = true;
    panX = dx; panY = dy;
    applyPan(img);
  });

  document.addEventListener('mouseup', () => {
    if (!isPanning) return;
    isPanning = false;
    const img = getActiveImg();
    if (img && img.classList.contains('lb-zoomed')) img.style.cursor = 'grab';
  });

  /* ─── Touch pan ─── */
  lbTrack.addEventListener('touchstart', (e) => {
    const img = e.target.closest('.lightbox-slide img');
    if (!img || !img.classList.contains('lb-zoomed')) return;
    const t    = e.changedTouches[0];
    touchId    = t.identifier;
    isPanning  = true;
    hasDragged = false;
    dragStartX = t.clientX - panX;
    dragStartY = t.clientY - panY;
    e.preventDefault();
  }, { passive: false });

  lbTrack.addEventListener('touchmove', (e) => {
    if (!isPanning || touchId === null) return;
    const t = [...e.changedTouches].find(x => x.identifier === touchId);
    if (!t) return;
    const img = getActiveImg();
    if (!img || !img.classList.contains('lb-zoomed')) return;
    const dx = t.clientX - dragStartX;
    const dy = t.clientY - dragStartY;
    if (Math.abs(dx - panX) > THRESH || Math.abs(dy - panY) > THRESH) hasDragged = true;
    panX = dx; panY = dy;
    applyPan(img);
    e.preventDefault();
  }, { passive: false });

  lbTrack.addEventListener('touchend', () => {
    isPanning = false;
    touchId   = null;
    // dezoom on tap is handled by the click event above
  });

  /* ─── Lightbox controls ─── */
  galleryTiles.forEach((tile, i) => tile.addEventListener('click', () => openLightbox(i)));
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-arrow.prev').addEventListener('click', () => lbGoTo(lbIndex - 1));
  lightbox.querySelector('.lightbox-arrow.next').addEventListener('click', () => lbGoTo(lbIndex + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbGoTo(lbIndex - 1);
    if (e.key === 'ArrowRight') lbGoTo(lbIndex + 1);
  });
})();
