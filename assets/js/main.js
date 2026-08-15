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

/* ─── Basic image-protection deterrent (right-click / drag) ──────
 * Client-side only — a determined visitor can still get the image via
 * devtools, view-source, or a screenshot. This just removes the casual
 * right-click-and-save / drag-out path. */
function guardImage(img) {
  img.addEventListener('contextmenu', (e) => e.preventDefault());
  img.addEventListener('dragstart', (e) => e.preventDefault());
}
document.querySelectorAll('.g-tile img').forEach(guardImage);

/* ─── Gallery lightbox ──────────────────────────────────────── */
(function () {
  const galleryTiles = document.querySelectorAll('.g-tile');
  const lightbox     = document.getElementById('lightbox');
  if (!galleryTiles.length || !lightbox) return;   // not a case-study page

  const stage     = lightbox.querySelector('.lightbox-track');
  const lbCounter = lightbox.querySelector('.lightbox-counter');
  const lbTotal   = galleryTiles.length;
  let   lbIndex   = 0;

  /* ─── One entry per tile: an image URL, or placeholder text. Read once
   * up front — after this, navigation only ever touches a single <img>,
   * so there's no multi-element track to misalign or size wrong. ─── */
  const items = Array.from(galleryTiles).map((tile) => {
    const img = tile.querySelector('img');
    if (img) return { src: img.src, alt: img.alt || '' };
    const ph = tile.querySelector('.cs-placeholder');
    return { placeholder: ph ? ph.textContent : '' };
  });

  const lbImg = document.createElement('img');
  lbImg.className = 'lightbox-img';
  guardImage(lbImg);
  const lbPlaceholder = document.createElement('div');
  lbPlaceholder.className = 'lightbox-img-placeholder';
  stage.appendChild(lbImg);
  stage.appendChild(lbPlaceholder);

  /* ─── Zoom + Pan state ─── */
  const ZOOM   = 2.5;
  const THRESH = 4;         // px before a mousedown counts as a drag
  let panX = 0, panY = 0;
  let isPanning = false, hasDragged = false;
  let dragStartX = 0, dragStartY = 0;
  let touchId = null;

  function applyPan() {
    lbImg.style.transition = 'none';
    lbImg.style.transform  = `scale(${ZOOM}) translate(${panX / ZOOM}px, ${panY / ZOOM}px)`;
  }

  function resetZoom() {
    lbImg.classList.remove('lb-zoomed');
    lbImg.style.transition      = '';
    lbImg.style.transform       = '';
    lbImg.style.transformOrigin = '';
    lbImg.style.cursor          = '';
    panX = 0; panY = 0;
  }

  function renderSlide() {
    resetZoom();
    const item = items[lbIndex];
    if (item.src) {
      lbImg.src            = item.src;
      lbImg.alt            = item.alt;
      lbImg.style.display  = '';
      lbPlaceholder.style.display = 'none';
    } else {
      lbImg.removeAttribute('src');
      lbImg.style.display  = 'none';
      lbPlaceholder.textContent  = item.placeholder;
      lbPlaceholder.style.display = '';
    }
    if (lbCounter) lbCounter.textContent = (lbIndex + 1) + ' / ' + lbTotal;
  }

  function openLightbox(index) {
    lbIndex = index;
    renderSlide();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    resetZoom();
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Crossfade to a new index — an opacity swap on one element, so there's
   * nothing that can end up showing the wrong image or the wrong size. */
  function lbGoTo(i) {
    const next = (i + lbTotal) % lbTotal;
    if (next === lbIndex) return;

    let swapped = false;
    function swap() {
      if (swapped) return;
      swapped = true;
      lbIndex = next;
      renderSlide();
      // Force the browser to paint the faded-out frame with the new image
      // before triggering the fade back in. Without this, Safari/iOS can
      // collapse both style changes into one frame and skip the transition,
      // which briefly shows the old and new image blended together.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => stage.classList.remove('is-fading'));
      });
    }

    stage.classList.add('is-fading');
    lbImg.addEventListener('transitionend', swap, { once: true });
    window.setTimeout(swap, 220);   // fallback in case transitionend doesn't fire
  }

  /* ─── Click: zoom in at cursor / dezoom on tap (only if not a drag) ─── */
  stage.addEventListener('click', (e) => {
    if (hasDragged) { hasDragged = false; return; }   // was a pan/swipe — ignore
    if (e.target !== lbImg) return;

    if (lbImg.classList.contains('lb-zoomed')) {
      resetZoom();
    } else {
      const rect = lbImg.getBoundingClientRect();
      const ox   = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const oy   = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      lbImg.style.transition      = '';
      lbImg.style.transformOrigin = `${ox} ${oy}`;
      lbImg.style.transform       = `scale(${ZOOM})`;
      lbImg.style.cursor          = 'grab';
      lbImg.classList.add('lb-zoomed');
      panX = 0; panY = 0;
    }
  });

  /* ─── Mouse pan ─── */
  stage.addEventListener('mousedown', (e) => {
    if (e.target !== lbImg || !lbImg.classList.contains('lb-zoomed')) return;
    isPanning   = true;
    hasDragged  = false;
    dragStartX  = e.clientX - panX;
    dragStartY  = e.clientY - panY;
    lbImg.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isPanning || !lbImg.classList.contains('lb-zoomed')) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx - panX) > THRESH || Math.abs(dy - panY) > THRESH) hasDragged = true;
    panX = dx; panY = dy;
    applyPan();
  });

  document.addEventListener('mouseup', () => {
    if (!isPanning) return;
    isPanning = false;
    if (lbImg.classList.contains('lb-zoomed')) lbImg.style.cursor = 'grab';
  });

  /* ─── Touch: pan when zoomed, swipe threshold to navigate otherwise ─── */
  let swipeStartX = 0, swipeStartY = 0, isSwiping = false;
  const SWIPE_THRESH = 50;   // px of release distance needed to commit to next/prev
  const DRAG_THRESH  = 6;    // px of movement before a touch counts as a drag (blocks zoom-click)

  stage.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];

    if (lbImg.classList.contains('lb-zoomed')) {
      touchId    = t.identifier;
      isPanning  = true;
      hasDragged = false;
      dragStartX = t.clientX - panX;
      dragStartY = t.clientY - panY;
      e.preventDefault();
    } else if (lbTotal > 1) {
      isSwiping   = true;
      hasDragged  = false;
      swipeStartX = t.clientX;
      swipeStartY = t.clientY;
    }
  }, { passive: false });

  stage.addEventListener('touchmove', (e) => {
    if (isPanning && touchId !== null) {
      const t = [...e.changedTouches].find(x => x.identifier === touchId);
      if (!t) return;
      const dx = t.clientX - dragStartX;
      const dy = t.clientY - dragStartY;
      if (Math.abs(dx - panX) > THRESH || Math.abs(dy - panY) > THRESH) hasDragged = true;
      panX = dx; panY = dy;
      applyPan();
      e.preventDefault();
      return;
    }

    if (isSwiping) {
      const t  = e.changedTouches[0];
      const dx = t.clientX - swipeStartX;
      const dy = t.clientY - swipeStartY;
      if (Math.abs(dx) > DRAG_THRESH) hasDragged = true;
      if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();  // horizontal drag owns the gesture
    }
  }, { passive: false });

  stage.addEventListener('touchend', (e) => {
    if (isPanning) {
      isPanning = false;
      touchId   = null;
      return;
    }
    if (!isSwiping) return;
    isSwiping = false;
    const t  = e.changedTouches[0];
    const dx = t.clientX - swipeStartX;
    const dy = t.clientY - swipeStartY;
    if (Math.abs(dx) > SWIPE_THRESH && Math.abs(dx) > Math.abs(dy)) {
      lbGoTo(dx < 0 ? lbIndex + 1 : lbIndex - 1);
    }
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
