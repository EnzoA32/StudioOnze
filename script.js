// Curseur personnalisé : un rond vert acide translucide qui remplace le curseur
// natif au survol des éléments cliquables (liens, boutons, cartes...).
if (matchMedia('(pointer:fine)').matches) {
  const dot = document.createElement('div');
  dot.id = 'cursorDot';
  document.body.appendChild(dot);
  window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  });
  const HOVER_SEL = 'a, button, .filmstrip-item, .grid-card, .service-item, input, select, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER_SEL)) dot.classList.add('show');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOVER_SEL) && !e.relatedTarget?.closest(HOVER_SEL)) dot.classList.remove('show');
  });
}

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
  let pending = false, dragging = false, startX = 0, startScroll = 0, pointerId = null;
  const DRAG_THRESHOLD = 6; // en dessous de ça, on considère que c'est un clic, pas un glisser

  function maxScroll(){ return filmstrip.scrollWidth - filmstrip.clientWidth; }

  travauxSection.addEventListener('wheel', (e) => {
    const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const delta = Math.max(-140, Math.min(140, rawDelta)); // évite les à-coups des gros deltas trackpad
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
    // pendant un glisser actif, le scroll suit directement le doigt/la souris (pas de lissage)
    if (!dragging) {
      const diff = target - filmstrip.scrollLeft;
      filmstrip.scrollLeft += Math.abs(diff) < 0.5 ? diff : diff * 0.22;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  filmstrip.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return; // le tactile garde son scroll natif
    pending = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    startScroll = filmstrip.scrollLeft;
  });
  filmstrip.addEventListener('pointermove', (e) => {
    if (!pending) return;
    const moved = e.clientX - startX;
    if (!dragging) {
      if (Math.abs(moved) < DRAG_THRESHOLD) return; // pas encore assez de mouvement : reste un clic
      dragging = true;
      filmstrip.classList.add('dragging');
      filmstrip.setPointerCapture(pointerId);
    }
    target = Math.min(Math.max(startScroll - moved, 0), maxScroll());
    filmstrip.scrollLeft = target;
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
    filmstrip.addEventListener(evt, () => {
      pending = false;
      dragging = false;
      filmstrip.classList.remove('dragging');
    });
  });
}

// Transition entre pages : la page actuelle et la suivante apparaissent un instant
// comme deux petites cartes côte à côte sur un fond kaki, puis celle de destination
// grandit pour prendre tout l'écran (façon "Time Travel"). On navigue réellement une
// fois l'animation terminée (la carte montre déjà le contenu réel de la page suivante).
const PAGES = [
  'index.html', 'travaux.html', 'apropos.html', 'contact.html',
  'projet-nova-editions.html', 'projet-atelier-mareges.html', 'projet-maison-verre.html',
  'projet-klint-studio.html', 'projet-perle-noire.html', 'projet-rivage-studio.html',
  'projet-freres-laurent.html', 'projet-manufacture-rive.html'
];

function startPageTransition(href){
  const overlay = document.createElement('div');
  overlay.id = 'navOverlay';

  const cardOld = document.createElement('div');
  cardOld.className = 'nav-card';
  const iframeOld = document.createElement('iframe');
  iframeOld.src = location.href;
  cardOld.appendChild(iframeOld);

  const cardNew = document.createElement('div');
  cardNew.className = 'nav-card';
  const iframeNew = document.createElement('iframe');
  iframeNew.src = href;
  cardNew.appendChild(iframeNew);

  overlay.appendChild(cardOld);
  overlay.appendChild(cardNew);
  document.body.appendChild(overlay);

  // 1) le fond apparaît, les deux cartes se posent côte à côte
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.classList.add('show');
    cardOld.classList.add('show');
    setTimeout(() => cardNew.classList.add('show'), 90);
  }));

  // 2) petit temps de pause pour laisser voir les deux cartes, puis la nouvelle grandit
  setTimeout(() => {
    cardOld.classList.add('fade-out');
    cardNew.classList.add('grow');
    setTimeout(() => { window.location.href = href; }, 620);
  }, 620);
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!PAGES.includes(href)) return;
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || link.target === '_blank') return;
  e.preventDefault();
  startPageTransition(href);
});

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
