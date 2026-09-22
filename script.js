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

// Thème clair/sombre
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

// Marque le lien actif dans la nav selon la page courante
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navlinks a, .mobilemenu a').forEach(a => {
  if (a.getAttribute('href') === path) a.classList.add('active');
});

// Aperçu qui suit le curseur sur la page Travaux (inspiré loveandmoney.com)
const preview = document.getElementById('cursorPreview');
const rows = document.querySelectorAll('.work-row a');
if (preview && rows.length && matchMedia('(pointer:fine)').matches) {
  const img = preview.querySelector('span');
  window.addEventListener('mousemove', e => {
    preview.style.left = e.clientX + 'px';
    preview.style.top = e.clientY + 'px';
  });
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      img.textContent = row.dataset.label || 'Visuel à venir';
      preview.classList.add('show');
    });
    row.addEventListener('mouseleave', () => preview.classList.remove('show'));
  });
}
