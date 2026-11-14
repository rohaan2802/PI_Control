const one = selector => document.querySelector(selector);
const root = document.documentElement;
const theme = one('#theme-toggle');
const scheme = matchMedia('(prefers-color-scheme: dark)');
let choice;
try { choice = localStorage.getItem('pi-control-theme'); } catch {}
function updateTheme(dark) {
  root.dataset.theme = dark ? 'dark' : 'light';
  theme.textContent = dark ? '☀' : '☾';
  theme.setAttribute('aria-pressed', String(dark));
}
updateTheme(choice ? choice === 'dark' : scheme.matches);
scheme.addEventListener('change', e => { if (!choice) updateTheme(e.matches); });
theme.addEventListener('click', () => {
  const dark = root.dataset.theme !== 'dark';
  choice = dark ? 'dark' : 'light';
  updateTheme(dark);
  try { localStorage.setItem('pi-control-theme', choice); } catch {}
});

const menu = one('#menu-toggle');
const nav = one('#nav-links');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
}
menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
const back = one('.back-top');
function updateTop() { back.hidden = scrollY < innerHeight * .75; }
addEventListener('scroll', updateTop, { passive: true });
addEventListener('resize', updateTop);
updateTop();

const cards = [...document.querySelectorAll('.site-gallery figure')];
const filters = [...document.querySelectorAll('[data-filter]')];
const search = one('#search');
let category = 'all';
let visible = cards;
function filter() {
  const terms = search.value.trim().toLowerCase().split(/\s+/);
  visible = cards.filter(card => {
    const text = card.textContent.toLowerCase();
    card.hidden = (category !== 'all' && category !== card.dataset.category) ||
      !terms.every(term => text.includes(term));
    return !card.hidden;
  });
  one('#count').textContent = visible.length ? `${visible.length} of ${cards.length} figures` : 'No matching figures.';
}
one('#gallery-controls').hidden = false;
search.addEventListener('input', filter);
for (const button of filters) button.addEventListener('click', () => {
  category = button.dataset.filter;
  for (const item of filters) item.setAttribute('aria-pressed', String(item === button));
  filter();
});
filter();

const dialog = one('dialog');
const viewport = one('.viewport');
const picture = viewport.querySelector('img');
const zoom = one('#zoom');
const prev = one('#prev');
const next = one('#next');
let opener;
let index = 0;
function setZoom(active) {
  viewport.classList.toggle('zoomed', active);
  zoom.textContent = active ? 'Fit image' : 'Zoom in';
  zoom.setAttribute('aria-pressed', String(active));
  viewport.scrollTo(0, 0);
}
function show(i) {
  index = (i + visible.length) % visible.length;
  const card = visible[index];
  picture.src = card.querySelector('a').href;
  picture.alt = card.querySelector('img').alt;
  one('#figure-title').textContent = picture.alt;
  one('#caption').textContent = card.querySelector('figcaption p').textContent;
  one('#original').href = picture.src;
  one('#position').textContent = `${index + 1} of ${visible.length}`;
  prev.disabled = next.disabled = visible.length === 1;
  setZoom(false);
}
for (const card of cards) {
  const link = card.querySelector('a');
  link.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || !dialog.showModal) return;
    e.preventDefault();
    opener = link;
    show(visible.indexOf(card));
    dialog.showModal();
  });
}
prev.addEventListener('click', () => show(index - 1));
next.addEventListener('click', () => show(index + 1));
zoom.addEventListener('click', () => setZoom(!viewport.classList.contains('zoomed')));
dialog.addEventListener('keydown', e => {
  if (e.target === viewport && viewport.classList.contains('zoomed')) return;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    show(index + (e.key === 'ArrowLeft' ? -1 : 1));
  }
});
dialog.addEventListener('close', () => opener?.focus());
let touch;
viewport.addEventListener('touchstart', e => {
  touch = e.touches.length === 1 && !viewport.classList.contains('zoomed') ? e.touches[0] : null;
}, { passive: true });
viewport.addEventListener('touchend', e => {
  if (!touch) return;
  const dx = e.changedTouches[0].clientX - touch.clientX;
  const dy = e.changedTouches[0].clientY - touch.clientY;
  touch = null;
  if (Math.abs(dx) > 55 && Math.abs(dx) > 1.5 * Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
}, { passive: true });
viewport.addEventListener('touchcancel', () => { touch = null; });

for (const region of document.querySelectorAll('.table-scroll, pre')) {
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'slider';
  slider.min = '0';
  slider.setAttribute('aria-label', 'Scroll horizontally: ' + region.getAttribute('aria-label'));
  region.after(slider);
  function sync() {
    slider.max = String(region.scrollWidth - region.clientWidth);
    slider.value = String(Math.round(region.scrollLeft));
    slider.hidden = Number(slider.max) <= 0;
  }
  slider.addEventListener('input', () => { region.scrollLeft = slider.valueAsNumber; });
  region.addEventListener('scroll', sync, { passive: true });
  new ResizeObserver(sync).observe(region);
  sync();
}
