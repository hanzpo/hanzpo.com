// Work experience data
const workExperiences = {
  rilla: {
    company: 'rilla',
    role: 'software engineer intern',
    dates: 'may 2026 - present',
    logo: '/images/rilla.png',
    logoAlt: 'rilla logo',
    description: 'building speech analytics for outside sales teams.',
    logoStyle: 'cover',
    hasWhiteBg: false,
  },
  kalshi: {
    company: 'kalshi',
    role: 'software engineer intern',
    dates: 'jan 2026 - apr 2026',
    logo: '/images/kalshi.png',
    logoAlt: 'kalshi logo',
    description: 'building software for the world\'s first regulated prediction market.',
    logoStyle: 'cover',
    hasWhiteBg: false,
  },
  shopify: {
    company: 'shopify',
    role: 'engineering intern',
    dates: 'may 2025 - aug 2025',
    logo: '/images/shopify_glyph.svg',
    logoAlt: 'shopify logo',
    description: 'worked on checkout flows for retail point of sale systems with ruby, react native, gRPC, and graphql.',
    logoStyle: 'contain',
    hasWhiteBg: true,
  },
  cohere: {
    company: 'cohere',
    role: 'senior data quality specialist',
    dates: 'sept 2024 - aug 2025',
    logo: '/images/cohere_logo.svg',
    logoAlt: 'cohere logo',
    description: 'worked on data quality and evaluation for language models on coding tasks.',
    logoStyle: 'contain',
    hasWhiteBg: true,
  },
};

// Modal functionality
function initModal() {
  const modal = document.getElementById('modal');
  const modalBackdrop = modal.querySelector('.modal-backdrop');
  const modalClose = modal.querySelector('.modal-close');
  const modalLogo = document.getElementById('modal-logo');
  const modalLogoImg = document.getElementById('modal-logo-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDates = document.getElementById('modal-dates');
  const modalDescription = document.getElementById('modal-description');

  function openModal(workId) {
    const experience = workExperiences[workId];
    if (!experience) return;

    // Update modal content
    modalLogoImg.src = experience.logo;
    modalLogoImg.alt = experience.logoAlt;
    modalLogoImg.className = experience.logoStyle === 'cover' ? 'logo-cover' : 'logo-contain';
    
    if (experience.hasWhiteBg) {
      modalLogo.classList.add('white-bg');
    } else {
      modalLogo.classList.remove('white-bg');
    }

    modalTitle.textContent = `${experience.company} — ${experience.role}`;
    modalDates.textContent = experience.dates;
    modalDescription.textContent = experience.description;

    // Show modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  let lastFocusedElement = null;

  // Event listeners for work cards
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => {
      lastFocusedElement = card;
      openModal(card.dataset.work);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lastFocusedElement = card;
        openModal(card.dataset.work);
      }
    });
  });

  // Focus the close button when modal opens
  const originalOpen = openModal;
  openModal = function(workId) {
    originalOpen(workId);
    modalClose.focus();
  };

  // Close modal events
  modalBackdrop.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Return focus to the card that opened the modal
  const originalClose = closeModal;
  closeModal = function() {
    originalClose();
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  };
}

// Entrance animations. The page is a single screen now, so everything
// animates in on load; each item carries its own delay via the --d custom
// property set in the markup.
function initEntranceAnimations() {
  const items = document.querySelectorAll('.animate-item');

  setTimeout(() => {
    items.forEach(item => {
      item.classList.add('visible');
    });
  }, 100);
}

// Fades the right column's edges to show it scrolls. Each edge grows with
// how far you've scrolled away from it, capped at FADE_MAX, so it eases in
// instead of popping and sits at 0 when there's nothing that direction --
// including when the layout collapses and the column stops scrolling at all.
function initScrollFade() {
  const column = document.querySelector('.index-right');
  if (!column) return;

  const FADE_MAX = 48;

  function update() {
    const scrollable = column.scrollHeight - column.clientHeight;
    const top = scrollable > 1 ? Math.min(column.scrollTop, FADE_MAX) : 0;
    const bottom =
      scrollable > 1 ? Math.min(scrollable - column.scrollTop, FADE_MAX) : 0;

    column.style.setProperty('--fade-top', `${top}px`);
    column.style.setProperty('--fade-bottom', `${bottom}px`);
  }

  column.addEventListener('scroll', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(column);
  update();
}

// Spinning ASCII earth -- a sphere rasterized into a <pre>. Each cell inside
// the disc is mapped back to a lat/lon on a tilted, rotating globe and looked
// up in a 2° land mask, so continents drift across the face
// as it turns. Land and ocean use different character ramps, shaded by a fixed
// light source. Rotation is driven by elapsed time so the speed doesn't depend
// on frame rate, and rendering is throttled to ~30fps since the text repaint
// is the expensive part. Under prefers-reduced-motion it draws one frame.
function initGlobe() {
  const el = document.getElementById('globe');
  if (!el) return;

  const W = 80;
  const H = 32;

  // Equirectangular land mask: 180 columns (lon -180..180) x 90 rows
  // (lat 90..-90), 2° per cell, packed one bit per cell (MSB first) and
  // base64 encoded. Generated from the global-land-mask dataset.
  const MW = 180;
  const MH = 90;
  const MASK_B64 =
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAHwAfvAAAAAAAAAAAAAAAAAAAAAAAAx37///+AAAAAGoABAAAAAAAAA' +
    'AAAAIe8P///wAA8AAAAAA0AAAAAAAAAAAwADw////4AAIAAAAAAHAAAAAAAAAAALivwAf//wAAAA' +
    'ADAAP/wAHIAAAAAADsj38AH/+gAAAAAEAH///OAAAAgBgAAfw3/gB/+gAAAgAMHe///+/9gBAP/7' +
    '/nbdrwD/+AAAH/Ag7H////////8H//////g8H/gAAAf/6//f////////Mf/////9H4D4A+AA+ev/' +
    '//////////AP/////4A0B4AAAD5/////////////Af1////gHgA4AAAP5///////////LwAHgD//' +
    '/gH0AAAAAG4/////////+AMAABAC///4D+AAAAGCx/////////4A4AAAAB////n/gAAAOCR/////' +
    '////4A4AAAAAf///3/wAAAbH//////////9AgAAAAAP/////gAAADf//////////9AAAAAAAF///' +
    '/0YAAAB///////////8AAAAAAAD////8EAAAB///v///////5AAAAAAAD////+AAAAB/f5f/////' +
    '//wAAAAAAAD////gAAAAfxnwP///////jgAAAAAAD///+AAAAAPCb3///////+AAAAAAAAD///8A' +
    'AAAAfCJf//////+ECAAAAAAAB///8AAAAAGDRf///////mMAAAAAAAA///8AAAAAH+Ai///////E' +
    '8AAAAAAAAf//wAAAAAP/AA///////BgAAAAAAAAP//gAAAAAf/73///////gAAAAAAAAAD/AQAAA' +
    'AAf//9/f/////gAAAAAAAAAF+AQAAAAB///+/n/////AAAAAAAAAAC+AAAAAAB///+fwH///+AAA' +
    'AAAAAAAAeAwAAAAD////f/D///8gAAAAAAAAAAeGEAAAAD////v+B/j/AAAAAAAAAAAAPMAwAAAD' +
    '////n+AfB+gAAAAAAAAAAAD8AAAAAD////34AeBfAgAAAAAAAAAAAPAAAAAH////3gAcAfAgAAAA' +
    'AAAAAAADAAAAAD////6AAcAfgwAAAAAAAAAAABBwAAAD////8wAMATAIAAAAAAAAAAAAr/AAAB//' +
    '///gAIASAAAAAAAAAAAAAAH/gAAA/////gACAAAIAAAAAAAAAAAAH/8AAAYH///AAAAsGAAAAAAA' +
    'AAAAAAH/+AAAAB//+AAAAUOAAAAAAAAAAAAAP/+AAAAB//8AAAAc+gAAAAAAAAAAAAP//gAAAD//' +
    '4AAAAMeBgAAAAAAAAAAAP//8AAAB//wAAAAGdCuAAAAAAAAAAAf///AAAA//wAAAACAAHgAAAAAA' +
    'AAAAP///gAAA//wAAAAB4AHggAAAAAAAAAH///AAAAf/wAAAAACIDQIAAAAAAAAAH//+AAAAf/wA' +
    'AAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//8AAAA//wgAAAAAHxgBAAAAAAA' +
    'AAA//8AAAA//zgAAAAAf/gAAAAAAAAAAAf/8AAAA//DgAAAAAf/gAAAAAAAAAAAf/8AAAAf/DAAA' +
    'AAD//4CAAAAAAAAAAf/wAAAAf/DAAAAAH//4AAAAAAAAAAAf/AAAAAf+DAAAAAH//8AAAAAAAAAA' +
    'Af/AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/8AAAAAH4AAAAAA' +
    'D//+AAAAAAAAAAA/8AAAAAHwAAAAAADwf8AAAAAAAAAAA/gAAAAAAAAAAAAACAP4AAAAAAAAAAB/' +
    'wAAAAAAAAAAAAAAAD4AEAAAAAAAAB+AAAAAAAAAAAAAAAAAAAGAAAAAAAAB6AAAAAAAAAAAAAAAA' +
    'AwAMAAAAAAAAA8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAAAwAAAAAAAAB4AA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAACAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAA' +
    'AAA8AAf/8d/AAAAAAAAAAAAkAAAAAAACP/+H//////AAAAAAAAAAA+AAAAIf////+////////AAA' +
    'AAAAOMKPAAAB///////////////gAAAH/8D//8AAAH//////////////4AAAF/////8AAAP/////' +
    '//////////4AAIf/////gwBwf///////////////4AAAH//////AAD////////////////wAAA//' +
    '/////+f//////////////////A/wH///////////////////////////////////////////////' +
    '////////////////////////////////////////';
  const bytes = atob(MASK_B64);
  const land = new Uint8Array(MW * MH);
  for (let i = 0; i < land.length; i++) {
    land[i] = (bytes.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  }

  const LAND_CH = '+*#%@';
  const SEA_CH = '..';

  // Character cells are roughly twice as tall as they are wide, so the disc
  // spans twice as many columns as rows.
  const cx = W / 2 - 0.5;
  const cy = H / 2 - 0.5;
  const RY = H / 2 - 0.5;
  const RX = RY * 2;

  // Axial tilt, leaning the pole to the right like a desk globe.
  const TILT = (23.4 * Math.PI) / 180;
  const cT = Math.cos(TILT), sT = Math.sin(TILT);

  // Light from the upper left, in front of the sphere.
  let Lx = -0.4, Ly = 0.5, Lz = 0.75;
  const Ln = Math.hypot(Lx, Ly, Lz);
  Lx /= Ln; Ly /= Ln; Lz /= Ln;

  function render(spin) {
    const rows = [];
    for (let y = 0; y < H; y++) {
      const ny = (cy - y) / RY;
      let line = '';
      for (let x = 0; x < W; x++) {
        const nx = (x - cx) / RX;
        const d = nx * nx + ny * ny;
        if (d > 1) { line += ' '; continue; }
        const nz = Math.sqrt(1 - d);

        // Diffuse shading, kept soft so the dark limb stays legible.
        let lum = nx * Lx + ny * Ly + nz * Lz;
        if (lum < 0) lum = 0;
        lum = 0.35 + 0.65 * lum;

        // Undo the tilt to get into the globe's own frame, then unwrap.
        const gx = nx * cT - ny * sT;
        const gy = ny * cT + nx * sT;
        const lat = Math.asin(gy);
        const lon = Math.atan2(gx, nz) - spin;

        let u = Math.floor((lon / (2 * Math.PI) + 0.5) * MW) % MW;
        if (u < 0) u += MW;
        let v = Math.floor((0.5 - lat / Math.PI) * MH);
        if (v < 0) v = 0; else if (v >= MH) v = MH - 1;

        const ramp = land[v * MW + u] ? LAND_CH : SEA_CH;
        line += ramp[Math.round(lum * (ramp.length - 1))];
      }
      rows.push(line);
    }
    el.textContent = rows.join('\n');
  }

  render(0.9);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let last = 0;
  function tick(now) {
    if (now - last >= 33) {
      last = now;
      render(0.9 + now * 0.0004);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initEntranceAnimations();
  initScrollFade();
  initGlobe();
});

