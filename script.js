// Menu mobile
const burger = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (burger) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

// Theme clair/sombre
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    if (current === 'dark') { root.setAttribute('data-theme', 'light'); }
    else if (current === 'light') { root.removeAttribute('data-theme'); }
    else { root.setAttribute('data-theme', 'dark'); }
  });
}

// Lien actif dans la nav selon la page courante
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navlinks a, .mobilemenu a').forEach(a => {
  if (a.getAttribute('href') === path) a.classList.add('active');
});

// Filmstrip Travaux récents : molette → défilement horizontal fluide (lerp),
// et une fois la fin du bandeau atteinte, la molette reprend le scroll normal de la page.
const filmstrip = document.querySelector('.filmstrip');
if (filmstrip) {
  const travauxSection = document.getElementById('travaux') || filmstrip;
  let target = filmstrip.scrollLeft;
  let dragging = false, startX = 0, startScroll = 0;

  function maxScroll(){ return filmstrip.scrollWidth - filmstrip.clientWidth; }

  travauxSection.addEventListener('wheel', (e) => {
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const max = maxScroll();
    const goingForward = delta > 0;
    const atEnd = target >= max - 1;
    const atStart = target <= 1;
    if ((goingForward && atEnd) || (!goingForward && atStart)) {
      return; // on laisse la page défiler normalement
    }
    e.preventDefault();
    target = Math.min(Math.max(target + delta, 0), max);
  }, { passive: false });

  function animate(){
    filmstrip.scrollLeft += (target - filmstrip.scrollLeft) * 0.14;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  filmstrip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return; // le tactile garde son scroll natif
    dragging = true;
    filmstrip.classList.add('dragging');
    filmstrip.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startScroll = filmstrip.scrollLeft;
  });
  filmstrip.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    target = Math.min(Math.max(startScroll - (e.clientX - startX), 0), maxScroll());
    filmstrip.scrollLeft = target;
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
    filmstrip.addEventListener(evt, () => {
      dragging = false;
      filmstrip.classList.remove('dragging');
    });
  });
}

// Bascule Grille / Liste + filtre par type sur la page Travaux
const viewBtns = document.querySelectorAll('.view-toggle button');
const typeSelect = document.getElementById('typeSelect');
if (viewBtns.length) {
  viewBtns.forEach(btn => btn.addEventListener('click', () => {
    viewBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view-block').forEach(v => v.classList.remove('active'));
    document.getElementById(btn.dataset.view + 'View').classList.add('active');
  }));
}
if (typeSelect) {
  typeSelect.addEventListener('change', () => {
    const val = typeSelect.value;
    document.querySelectorAll('.grid-card, .work-row').forEach(el => {
      el.style.display = (val === 'all' || el.dataset.type === val) ? '' : 'none';
    });
  });
}

// Aperçu flottant avec inertie sur la page Travaux (inspiré loveandmoney.com)
const preview = document.getElementById('cursorPreview');
const rows = document.querySelectorAll('.work-row a');
if (preview && rows.length && matchMedia('(pointer:fine)').matches) {
  const label = preview.querySelector('span');
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0, active = false;

  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function loop(){
    curX += (mouseX - curX) * 0.16;
    curY += (mouseY - curY) * 0.16;
    preview.style.left = curX + 'px';
    preview.style.top = curY + 'px';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      label.textContent = row.dataset.label || 'Visuel à venir';
      preview.classList.add('show');
    });
    row.addEventListener('mouseleave', () => preview.classList.remove('show'));
  });
}
